/**
 * Text-based citation formatting for CLI output.
 * Provides human-readable citation display without React.
 */

import type { Citation, CitationStatus } from "../types/citation.js";
import type { FoundHighlightLocation } from "../types/foundHighlight.js";
import { getCitationStatus } from "../parsing/parseCitation.js";
import { generateCitationKey } from "../react/utils.js";

/**
 * Unicode status indicators for different citation states
 */
export const CITATION_INDICATORS = {
  verified: "✓",
  partial: "⚠",
  miss: "✗",
  pending: "…",
} as const;

/**
 * ANSI color codes for terminal output
 */
export const ANSI_COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  strikethrough: "\x1b[9m",
} as const;

/**
 * Options for formatting citations
 */
export interface FormatCitationOptions {
  /** Whether to use ANSI colors (default: true) */
  useColors?: boolean;
  /** Citation display variant */
  variant?: "brackets" | "numeric" | "text" | "minimal" | "indicator";
  /** Whether to show the citation value instead of number */
  displayValue?: boolean;
}

/**
 * Options for formatting a full response with citations
 */
export interface FormatResponseOptions extends FormatCitationOptions {
  /** Whether to include a citation summary at the end */
  includeSummary?: boolean;
  /** Whether to include detailed verification info */
  includeDetails?: boolean;
}

/**
 * Get the status indicator character with optional coloring
 */
export function getStatusIndicator(
  status: CitationStatus,
  useColors = true
): string {
  if (status.isVerified && !status.isPartialMatch) {
    const indicator = CITATION_INDICATORS.verified;
    return useColors
      ? `${ANSI_COLORS.green}${indicator}${ANSI_COLORS.reset}`
      : indicator;
  }
  if (status.isPartialMatch) {
    const indicator = CITATION_INDICATORS.partial;
    return useColors
      ? `${ANSI_COLORS.yellow}${indicator}${ANSI_COLORS.reset}`
      : indicator;
  }
  if (status.isMiss) {
    const indicator = CITATION_INDICATORS.miss;
    return useColors
      ? `${ANSI_COLORS.red}${indicator}${ANSI_COLORS.reset}`
      : indicator;
  }
  if (status.isPending) {
    const indicator = CITATION_INDICATORS.pending;
    return useColors
      ? `${ANSI_COLORS.gray}${indicator}${ANSI_COLORS.reset}`
      : indicator;
  }
  return "";
}

/**
 * Get a human-readable status label
 */
export function getStatusLabel(status: CitationStatus): string {
  if (status.isVerified && !status.isPartialMatch) return "Verified";
  if (status.isPartialMatch) return "Partial Match";
  if (status.isMiss) return "Not Found";
  if (status.isPending) return "Pending";
  return "Unknown";
}

/**
 * Format a single citation for CLI display
 */
export function formatCitation(
  citation: Citation,
  foundCitation?: FoundHighlightLocation | null,
  options: FormatCitationOptions = {}
): string {
  const { useColors = true, variant = "brackets", displayValue = false } = options;
  const status = getCitationStatus(foundCitation ?? null);
  const indicator = getStatusIndicator(status, useColors);

  // Get display text
  let displayText: string;
  if (variant === "numeric") {
    displayText = citation.citationNumber?.toString() ?? "";
  } else if (displayValue || variant === "text" || variant === "minimal") {
    displayText =
      citation.value || citation.citationNumber?.toString() || "";
  } else {
    displayText = citation.citationNumber?.toString() || "";
  }

  // Apply text styling based on found status
  let styledText = displayText;
  if (useColors) {
    if (status.isVerified || status.isPartialMatch) {
      styledText = `${ANSI_COLORS.blue}${displayText}${ANSI_COLORS.reset}`;
    } else if (status.isMiss) {
      styledText = `${ANSI_COLORS.gray}${ANSI_COLORS.strikethrough}${displayText}${ANSI_COLORS.reset}`;
    } else if (status.isPending) {
      styledText = `${ANSI_COLORS.dim}${displayText}${ANSI_COLORS.reset}`;
    }
  }

  // Format based on variant
  switch (variant) {
    case "indicator":
      return indicator;
    case "numeric":
      return `${styledText}${indicator}`;
    case "text":
      return `${styledText}${indicator}`;
    case "minimal":
      return `${styledText}${indicator}`;
    case "brackets":
    default:
      return `[${styledText}${indicator}]`;
  }
}

/**
 * Format detailed citation info for verbose output
 */
export function formatCitationDetails(
  citation: Citation,
  foundCitation?: FoundHighlightLocation | null,
  options: { useColors?: boolean } = {}
): string {
  const { useColors = true } = options;
  const status = getCitationStatus(foundCitation ?? null);
  const statusLabel = getStatusLabel(status);
  const indicator = getStatusIndicator(status, useColors);

  const lines: string[] = [];

  // Header
  const citationNum = citation.citationNumber ?? "?";
  const header = useColors
    ? `${ANSI_COLORS.bold}Citation ${citationNum}${ANSI_COLORS.reset} ${indicator}`
    : `Citation ${citationNum} ${indicator}`;
  lines.push(header);

  // Status
  lines.push(`  Status: ${statusLabel}`);

  // Page/location info
  if (citation.pageNumber) {
    lines.push(`  Page: ${citation.pageNumber}`);
  }
  if (foundCitation?.pageNumber && foundCitation.pageNumber !== citation.pageNumber) {
    lines.push(`  Found on page: ${foundCitation.pageNumber}`);
  }

  // Quoted text
  if (citation.fullPhrase) {
    const phrase =
      citation.fullPhrase.length > 100
        ? citation.fullPhrase.slice(0, 100) + "…"
        : citation.fullPhrase;
    lines.push(`  Quoted: "${phrase}"`);
  }

  // Key span
  if (citation.keySpan) {
    lines.push(`  Key span: "${citation.keySpan}"`);
  }

  // Match snippet (what was actually found)
  if (foundCitation?.matchSnippet) {
    const snippet =
      foundCitation.matchSnippet.length > 100
        ? foundCitation.matchSnippet.slice(0, 100) + "…"
        : foundCitation.matchSnippet;
    lines.push(`  Found: "${snippet}"`);
  }

  // Reasoning
  if (citation.reasoning) {
    lines.push(`  Reasoning: ${citation.reasoning}`);
  }

  return lines.join("\n");
}

/**
 * Result of formatting a response with citations
 */
export interface FormattedResponse {
  /** The formatted text with inline citation markers */
  text: string;
  /** Summary of citation verification results */
  summary: string;
  /** Detailed info for each citation */
  details: string[];
  /** Statistics about citations */
  stats: {
    total: number;
    verified: number;
    partial: number;
    missed: number;
    pending: number;
  };
}

/**
 * Replace citation XML tags in text with formatted inline citations
 */
export function formatResponseWithCitations(
  responseText: string,
  citations: Record<string, Citation>,
  foundHighlights: Record<string, FoundHighlightLocation>,
  options: FormatResponseOptions = {}
): FormattedResponse {
  const { useColors = true, variant = "brackets", includeSummary = true, includeDetails = false } = options;

  // Track statistics
  const stats = {
    total: 0,
    verified: 0,
    partial: 0,
    missed: 0,
    pending: 0,
  };

  const details: string[] = [];

  // Replace cite tags with formatted citations
  // Match XML cite tags: <cite ... />
  const citeTagRegex = /<cite\s+[^>]*\/>/gi;

  let formattedText = responseText.replace(citeTagRegex, (match) => {
    // Try to find the corresponding citation
    // Extract file_id and full_phrase to match
    const fileIdMatch = match.match(/file_id=['"]([^'"]+)['"]/i);
    const fullPhraseMatch = match.match(/full_phrase=['"]([^'"]+)['"]/i);

    // Find matching citation by properties
    let matchedCitation: Citation | undefined;
    let matchedKey: string | undefined;

    for (const [key, citation] of Object.entries(citations)) {
      const fileIdMatches = !fileIdMatch || citation.fileId === fileIdMatch[1];
      const phraseMatches = !fullPhraseMatch || citation.fullPhrase === fullPhraseMatch[1];

      if (fileIdMatches && phraseMatches) {
        matchedCitation = citation;
        matchedKey = key;
        break;
      }
    }

    if (!matchedCitation || !matchedKey) {
      // Citation not found in our map, keep original
      return match;
    }

    const foundCitation = foundHighlights[matchedKey] ?? null;
    const status = getCitationStatus(foundCitation);

    // Update stats
    stats.total++;
    if (status.isVerified && !status.isPartialMatch) stats.verified++;
    else if (status.isPartialMatch) stats.partial++;
    else if (status.isMiss) stats.missed++;
    else if (status.isPending) stats.pending++;

    // Collect details if requested
    if (includeDetails) {
      details.push(formatCitationDetails(matchedCitation, foundCitation, { useColors }));
    }

    return formatCitation(matchedCitation, foundCitation, { useColors, variant });
  });

  // Generate summary
  let summary = "";
  if (includeSummary && stats.total > 0) {
    const parts: string[] = [];

    if (stats.verified > 0) {
      const verifiedText = `${stats.verified} verified`;
      parts.push(
        useColors
          ? `${ANSI_COLORS.green}${verifiedText}${ANSI_COLORS.reset}`
          : verifiedText
      );
    }
    if (stats.partial > 0) {
      const partialText = `${stats.partial} partial`;
      parts.push(
        useColors
          ? `${ANSI_COLORS.yellow}${partialText}${ANSI_COLORS.reset}`
          : partialText
      );
    }
    if (stats.missed > 0) {
      const missedText = `${stats.missed} not found`;
      parts.push(
        useColors
          ? `${ANSI_COLORS.red}${missedText}${ANSI_COLORS.reset}`
          : missedText
      );
    }
    if (stats.pending > 0) {
      const pendingText = `${stats.pending} pending`;
      parts.push(
        useColors
          ? `${ANSI_COLORS.gray}${pendingText}${ANSI_COLORS.reset}`
          : pendingText
      );
    }

    summary = `\n---\nCitations: ${stats.total} total (${parts.join(", ")})`;
  }

  return {
    text: formattedText,
    summary,
    details,
    stats,
  };
}

/**
 * Format a citation verification summary table
 */
export function formatCitationSummaryTable(
  citations: Record<string, Citation>,
  foundHighlights: Record<string, FoundHighlightLocation>,
  options: { useColors?: boolean } = {}
): string {
  const { useColors = true } = options;

  const lines: string[] = [];
  const header = useColors
    ? `${ANSI_COLORS.bold}Citation Verification Summary${ANSI_COLORS.reset}`
    : "Citation Verification Summary";
  lines.push(header);
  lines.push("─".repeat(50));

  // Table header
  lines.push(
    padRight("#", 4) +
      padRight("Status", 14) +
      padRight("Page", 6) +
      "Quote"
  );
  lines.push("─".repeat(50));

  // Sort citations by number
  const sortedEntries = Object.entries(citations).sort((a, b) => {
    const numA = a[1].citationNumber ?? 0;
    const numB = b[1].citationNumber ?? 0;
    return numA - numB;
  });

  for (const [key, citation] of sortedEntries) {
    const foundCitation = foundHighlights[key] ?? null;
    const status = getCitationStatus(foundCitation);
    const indicator = getStatusIndicator(status, useColors);
    const statusLabel = getStatusLabel(status);

    const num = (citation.citationNumber ?? "?").toString();
    const page = (citation.pageNumber ?? "-").toString();
    const quote = citation.fullPhrase
      ? citation.fullPhrase.slice(0, 30) + (citation.fullPhrase.length > 30 ? "…" : "")
      : "-";

    lines.push(
      padRight(num, 4) +
        padRight(`${indicator} ${statusLabel}`, 14 + (useColors ? 9 : 0)) + // Account for ANSI codes
        padRight(page, 6) +
        quote
    );
  }

  lines.push("─".repeat(50));

  return lines.join("\n");
}

/**
 * Pad a string to the right with spaces
 */
function padRight(str: string, length: number): string {
  return str + " ".repeat(Math.max(0, length - str.length));
}

/**
 * Remove all citation tags from text, leaving just the content
 */
export function stripCitationTags(text: string): string {
  return text.replace(/<cite\s+[^>]*\/>/gi, "").trim();
}

/**
 * Format a simple inline citation reference for markdown output
 */
export function formatMarkdownCitation(
  citation: Citation,
  foundCitation?: FoundHighlightLocation | null
): string {
  const status = getCitationStatus(foundCitation ?? null);
  const indicator = status.isVerified
    ? "✓"
    : status.isPartialMatch
      ? "⚠"
      : status.isMiss
        ? "✗"
        : "…";

  const num = citation.citationNumber ?? "?";
  return `[${num}${indicator}]`;
}

/**
 * Generate a markdown footnotes section for citations
 */
export function formatMarkdownFootnotes(
  citations: Record<string, Citation>,
  foundHighlights: Record<string, FoundHighlightLocation>
): string {
  const lines: string[] = [];
  lines.push("\n---\n**Citations:**\n");

  const sortedEntries = Object.entries(citations).sort((a, b) => {
    const numA = a[1].citationNumber ?? 0;
    const numB = b[1].citationNumber ?? 0;
    return numA - numB;
  });

  for (const [key, citation] of sortedEntries) {
    const foundCitation = foundHighlights[key] ?? null;
    const status = getCitationStatus(foundCitation);
    const statusLabel = getStatusLabel(status);

    const num = citation.citationNumber ?? "?";
    const page = citation.pageNumber ? ` (p. ${citation.pageNumber})` : "";
    const quote = citation.fullPhrase
      ? `"${citation.fullPhrase.slice(0, 80)}${citation.fullPhrase.length > 80 ? "…" : ""}"`
      : "";

    lines.push(`${num}. ${statusLabel}${page}: ${quote}`);
  }

  return lines.join("\n");
}
