import { getCitationStatus } from "../../parsing/parseCitation.js";
import { generateCitationKey } from "../../react/utils.js";
import { getIndicator, formatPageLocation } from "../../markdown/markdownVariants.js";
import type { Citation } from "../../types/citation.js";
import { buildProofUrl, buildSnippetImageUrl } from "../proofUrl.js";
import type { RenderCitationWithStatus } from "../types.js";
import {
  renderGitHubCitation,
  getStatusLabel,
  renderGitHubSourcesTable,
  renderGitHubSourcesList,
  renderGitHubSourcesDetailed,
} from "./githubVariants.js";
import type { GitHubOutput, GitHubRenderOptions } from "./types.js";

/**
 * Module-level compiled regex for cite tag matching.
 */
const CITE_TAG_REGEX = /<cite\s+[^>]*?\/>/g;

const ATTR_REGEX_PATTERN = /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(['"])((?:[^'"\\]|\\.)*)\2/g;

function parseCiteAttributes(citeTag: string): Record<string, string | undefined> {
  const attrs: Record<string, string | undefined> = {};
  const attrRegex = new RegExp(ATTR_REGEX_PATTERN.source, ATTR_REGEX_PATTERN.flags);
  let match: RegExpExecArray | null;
  for (;;) {
    match = attrRegex.exec(citeTag);
    if (!match) break;
    const key = match[1].replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
    attrs[key] = match[3];
  }
  return attrs;
}

function buildCitationFromAttrs(attrs: Record<string, string | undefined>, citationNumber: number): Citation {
  const unescapeText = (str: string | undefined): string | undefined =>
    str?.replace(/\\'/g, "'").replace(/\\"/g, '"');

  const parsePageNumber = (pageStr?: string): number | undefined => {
    if (!pageStr) return undefined;
    const m = pageStr.match(/\d+/);
    return m ? parseInt(m[0], 10) : undefined;
  };

  const parseLineIds = (lineIdsStr?: string): number[] | undefined => {
    if (!lineIdsStr) return undefined;
    const nums = lineIdsStr.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
    return nums.length > 0 ? nums : undefined;
  };

  return {
    attachmentId: attrs.attachment_id,
    pageNumber: attrs.page_number ? parseInt(attrs.page_number, 10) : parsePageNumber(attrs.start_page_id),
    fullPhrase: unescapeText(attrs.full_phrase),
    anchorText: unescapeText(attrs.anchor_text),
    lineIds: parseLineIds(attrs.line_ids),
    citationNumber,
  };
}

/**
 * Render LLM output with <cite /> tags as GitHub-flavored Markdown.
 *
 * @example
 * ```typescript
 * import { renderCitationsForGitHub } from "@deepcitation/deepcitation-js/github";
 *
 * const output = renderCitationsForGitHub(llmOutput, {
 *   verifications,
 *   variant: "brackets",
 *   proofBaseUrl: "https://proof.deepcitation.com",
 *   includeSources: true,
 *   sourcesFormat: "table",
 * });
 * ```
 */
export function renderCitationsForGitHub(input: string, options: GitHubRenderOptions = {}): GitHubOutput {
  const {
    verifications = {},
    indicatorStyle = "check",
    proofBaseUrl,
    includeSources = false,
    sourceLabels = {},
    variant = "brackets",
    sourcesFormat = "table",
    includeImages = false,
  } = options;

  const citationsWithStatus: RenderCitationWithStatus[] = [];
  const proofUrls: Record<string, string> = {};
  let citationIndex = 0;

  const citationRegex = new RegExp(CITE_TAG_REGEX.source, CITE_TAG_REGEX.flags);

  const markdown = input.replace(citationRegex, match => {
    citationIndex++;
    const attrs = parseCiteAttributes(match);
    const citation = buildCitationFromAttrs(attrs, citationIndex);
    const citationKey = generateCitationKey(citation);
    const verification = verifications[citationKey] || null;
    const status = getCitationStatus(verification);

    let proofUrl: string | undefined;
    if (proofBaseUrl) {
      proofUrl = buildProofUrl(citationKey, { baseUrl: proofBaseUrl });
      proofUrls[citationKey] = proofUrl;
    }

    citationsWithStatus.push({
      citation,
      citationKey,
      verification,
      status,
      citationNumber: citationIndex,
    });

    return renderGitHubCitation(citationIndex, citation.anchorText ?? undefined, status, indicatorStyle, proofUrl, variant);
  });

  // Build sources section
  let sources: string | undefined;
  if (includeSources && citationsWithStatus.length > 0) {
    const entries = citationsWithStatus.map(cws => {
      const label =
        sourceLabels[cws.citation.attachmentId || ""] ||
        cws.verification?.label ||
        cws.citation.title ||
        `Source ${cws.citationNumber}`;
      const location = formatPageLocation(cws.citation, cws.verification, { showPageNumber: true, showLinePosition: false });
      const indicator = getIndicator(cws.status, indicatorStyle);
      const statusLabel = getStatusLabel(cws.status);
      const proofUrl = proofUrls[cws.citationKey];

      let imageUrl: string | undefined;
      if (includeImages && proofBaseUrl) {
        imageUrl = buildSnippetImageUrl(cws.citationKey, { baseUrl: proofBaseUrl });
      }

      return {
        citationNumber: cws.citationNumber,
        indicator,
        statusLabel,
        sourceLabel: label,
        location,
        quote: cws.citation.fullPhrase ?? undefined,
        proofUrl,
        imageUrl,
      };
    });

    if (variant === "footnote") {
      // Generate footnote definitions
      const footnoteLines = entries.map(entry => {
        const location = entry.location ? ` — ${entry.location}` : "";
        const proofLink = entry.proofUrl ? ` [View proof](${entry.proofUrl})` : "";
        return `[^${entry.citationNumber}]: ${entry.indicator} ${entry.sourceLabel}${location}${proofLink}`;
      });
      sources = footnoteLines.join("\n");
    } else if (sourcesFormat === "detailed") {
      sources = renderGitHubSourcesDetailed(entries);
    } else if (sourcesFormat === "list") {
      sources = renderGitHubSourcesList(entries);
    } else {
      sources = renderGitHubSourcesTable(entries);
    }
  }

  const full = sources ? `${markdown}\n\n${sources}` : markdown;

  return {
    content: markdown,
    markdown,
    sources,
    full,
    citations: citationsWithStatus,
    proofUrls: Object.keys(proofUrls).length > 0 ? proofUrls : undefined,
  };
}
