import type { Citation } from "../types/citation.js";
import type { Verification } from "../types/verification.js";
import type { CitationStatus } from "../types/citation.js";
import type {
  MarkdownVariant,
  IndicatorStyle,
  LinePosition,
  RenderMarkdownOptions,
  CitationWithStatus,
} from "./types.js";
import { INDICATOR_SETS, SUPERSCRIPT_DIGITS } from "./types.js";

/**
 * Get the indicator string for a verification status.
 */
export function getIndicator(
  status: CitationStatus,
  style: IndicatorStyle = "check"
): string {
  const indicators = INDICATOR_SETS[style];

  if (status.isMiss) return indicators.notFound;
  if (status.isPartialMatch) return indicators.partial;
  if (status.isVerified) return indicators.verified;
  if (status.isPending) return indicators.pending;

  return indicators.pending;
}

/**
 * Convert a number to unicode superscript.
 * @example toSuperscript(123) => "¹²³"
 */
export function toSuperscript(num: number): string {
  return String(num)
    .split("")
    .map((digit) => SUPERSCRIPT_DIGITS[parseInt(digit, 10)] || digit)
    .join("");
}

/**
 * Humanize a line ID to a relative position on the page.
 * Returns null if totalLinesOnPage is not available.
 *
 * @example humanizeLinePosition(10, 100) => "start"
 * @example humanizeLinePosition(50, 100) => "middle"
 */
export function humanizeLinePosition(
  lineId: number,
  totalLinesOnPage: number | null | undefined
): LinePosition | null {
  if (!totalLinesOnPage || totalLinesOnPage <= 0) return null;

  const ratio = lineId / totalLinesOnPage;

  if (ratio < 0.2) return "start";
  if (ratio < 0.33) return "early";
  if (ratio < 0.66) return "middle";
  if (ratio < 0.8) return "late";
  return "end";
}

/**
 * Get display text from a citation based on variant needs.
 */
export function getCitationDisplayText(
  citation: Citation,
  variant: MarkdownVariant
): string {
  switch (variant) {
    case "brackets":
    case "superscript":
    case "footnote":
    case "minimal":
      return String(citation.citationNumber || 1);
    case "academic":
    case "inline":
    default:
      return citation.anchorText || citation.fullPhrase || String(citation.citationNumber || 1);
  }
}

/**
 * Format page location string with optional humanized line position.
 */
export function formatPageLocation(
  citation: Citation,
  verification: Verification | null,
  options: RenderMarkdownOptions
): string {
  const { showPageNumber = true, showLinePosition = true } = options;

  if (!showPageNumber) return "";

  const pageNumber = verification?.verifiedPageNumber ?? citation.pageNumber;
  if (!pageNumber || pageNumber < 0) return "";

  let location = `p.${pageNumber}`;

  // Add humanized line position for mismatches if available
  // Note: totalLinesOnPage is not currently in the Verification type.
  // When the API adds this field, humanization can be enabled.
  // For now, we skip line position humanization until the API supports it.
  if (
    showLinePosition &&
    verification?.status === "found_on_other_line" &&
    citation.lineIds?.length &&
    verification.verifiedLineIds?.length
  ) {
    const expectedLineId = citation.lineIds[0];
    const foundLineId = verification.verifiedLineIds[0];
    // Cast to access potential future field - will be undefined until API adds it
    const totalLines = (verification as { totalLinesOnPage?: number }).totalLinesOnPage;

    const expectedPos = humanizeLinePosition(expectedLineId, totalLines);
    const foundPos = humanizeLinePosition(foundLineId, totalLines);

    if (expectedPos && foundPos && expectedPos !== foundPos) {
      location += ` (expected ${expectedPos}, found ${foundPos})`;
    }
  }

  return location;
}

/**
 * Render a citation in the specified markdown variant.
 */
export function renderCitationVariant(
  citationWithStatus: CitationWithStatus,
  options: RenderMarkdownOptions
): string {
  const { variant = "inline", indicatorStyle = "check", linkStyle = "anchor" } = options;
  const { citation, status, citationNumber } = citationWithStatus;

  const indicator = getIndicator(status, indicatorStyle);
  const num = citationNumber;

  switch (variant) {
    case "inline": {
      const text = citation.anchorText || "";
      const anchor = linkStyle === "anchor" ? `[${text}${indicator}](#ref-${num})` : `${text}${indicator}`;
      return anchor;
    }

    case "brackets": {
      const anchor = linkStyle === "anchor" ? `[${num}${indicator}](#ref-${num})` : `[${num}${indicator}]`;
      return anchor;
    }

    case "superscript": {
      const sup = toSuperscript(num);
      const anchor = linkStyle === "anchor" ? `[${sup}${indicator}](#ref-${num})` : `${sup}${indicator}`;
      return anchor;
    }

    case "footnote": {
      // Markdown footnote syntax doesn't support inline indicators
      return `[^${num}]`;
    }

    case "academic": {
      const sourceLabel = options.sourceLabels?.[citation.attachmentId || ""] || "Source";
      const page = citation.pageNumber ? `, p.${citation.pageNumber}` : "";
      const anchor = linkStyle === "anchor"
        ? `[(${sourceLabel}${page})${indicator}](#ref-${num})`
        : `(${sourceLabel}${page})${indicator}`;
      return anchor;
    }

    case "minimal": {
      const anchor = linkStyle === "anchor" ? `[${indicator}](#ref-${num})` : indicator;
      return anchor;
    }

    default:
      return indicator;
  }
}

/**
 * Render a single reference entry for the references section.
 */
export function renderReferenceEntry(
  citationWithStatus: CitationWithStatus,
  options: RenderMarkdownOptions
): string {
  const { variant = "inline", indicatorStyle = "check", showReasoning = false } = options;
  const { citation, verification, status, citationNumber } = citationWithStatus;

  const indicator = getIndicator(status, indicatorStyle);
  const location = formatPageLocation(citation, verification, options);
  const quote = citation.fullPhrase || citation.anchorText || "";

  // Build the reference line
  const lines: string[] = [];

  if (variant === "footnote") {
    // Footnote style: [^1]: "quote" - location ✓
    let entry = `[^${citationNumber}]: `;
    if (quote) entry += `"${quote}"`;
    if (location) entry += ` - ${location}`;
    entry += ` ${indicator}`;
    lines.push(entry);
  } else {
    // Standard reference style with anchor
    const anchorText = citation.anchorText || `Citation ${citationNumber}`;
    let entry = `<a id="ref-${citationNumber}"></a>\n`;
    entry += `**[${citationNumber}]** ${indicator}`;
    if (anchorText && anchorText !== `Citation ${citationNumber}`) {
      entry += ` **${anchorText}**`;
    }
    if (location) entry += ` - ${location}`;
    lines.push(entry);

    // Add quote as blockquote
    if (quote) {
      lines.push(`> "${quote}"`);
    }

    // Add reasoning if requested
    if (showReasoning && citation.reasoning) {
      lines.push(`> *${citation.reasoning}*`);
    }
  }

  return lines.join("\n");
}

/**
 * Render the full references section.
 */
export function renderReferencesSection(
  citations: CitationWithStatus[],
  options: RenderMarkdownOptions
): string {
  const { referenceHeading = "## References", variant = "inline" } = options;

  if (citations.length === 0) return "";

  const lines: string[] = [referenceHeading, ""];

  if (variant === "footnote") {
    // Footnote style: all entries on their own lines
    for (const citation of citations) {
      lines.push(renderReferenceEntry(citation, options));
    }
  } else {
    // Group by status for better organization
    const verified = citations.filter((c) => c.status.isVerified && !c.status.isPartialMatch);
    const partial = citations.filter((c) => c.status.isPartialMatch);
    const notFound = citations.filter((c) => c.status.isMiss);
    const pending = citations.filter((c) => c.status.isPending && !c.status.isVerified && !c.status.isMiss);

    if (verified.length > 0) {
      lines.push("### Verified", "");
      for (const citation of verified) {
        lines.push(renderReferenceEntry(citation, options), "");
      }
    }

    if (partial.length > 0) {
      lines.push("### Partial Match", "");
      for (const citation of partial) {
        lines.push(renderReferenceEntry(citation, options), "");
      }
    }

    if (notFound.length > 0) {
      lines.push("### Not Found", "");
      for (const citation of notFound) {
        lines.push(renderReferenceEntry(citation, options), "");
      }
    }

    if (pending.length > 0) {
      lines.push("### Pending", "");
      for (const citation of pending) {
        lines.push(renderReferenceEntry(citation, options), "");
      }
    }
  }

  return lines.join("\n").trim();
}
