/**
 * Streaming citation parser for CLI output.
 * Parses out citation tags during streaming and replaces them with
 * verification status indicators when complete.
 */

import type { Citation } from "../types/citation.js";
import type { FoundHighlightLocation } from "../types/foundHighlight.js";
import { parseCitation, getCitationStatus } from "../parsing/parseCitation.js";
import { generateCitationKey } from "../react/utils.js";
import {
  formatCitation,
  getStatusIndicator,
  getStatusLabel,
  ANSI_COLORS,
  type FormatCitationOptions,
} from "./formatCitation.js";

/**
 * State for tracking streaming citation parsing
 */
export interface StreamingParserState {
  /** Buffer for incomplete text that might contain partial cite tags */
  buffer: string;
  /** Accumulated clean text (cite tags stripped) */
  cleanText: string;
  /** Extracted citations with their positions in clean text */
  citations: Map<number, { citation: Citation; key: string }>;
  /** Current citation number counter */
  citationCounter: number;
  /** Positions in clean text where citations should be inserted */
  citationPositions: Array<{ position: number; key: string }>;
}

/**
 * Result of processing a text chunk
 */
export interface ChunkResult {
  /** Clean text to display (cite tags stripped) */
  displayText: string;
  /** Whether there's buffered content waiting for more input */
  hasBufferedContent: boolean;
}

/**
 * Create a new streaming parser state
 */
export function createStreamingParser(): StreamingParserState {
  return {
    buffer: "",
    cleanText: "",
    citations: new Map(),
    citationCounter: 1,
    citationPositions: [],
  };
}

/**
 * Process a chunk of streaming text, extracting and hiding citation tags
 *
 * @param state - Current parser state (mutated)
 * @param chunk - New text chunk to process
 * @returns Clean text to display for this chunk
 */
export function processStreamingChunk(
  state: StreamingParserState,
  chunk: string
): ChunkResult {
  // Add new chunk to buffer
  state.buffer += chunk;

  let displayText = "";
  let searchStart = 0;

  // Process complete cite tags
  const citeTagRegex = /<cite\s+[^>]*\/>/gi;

  while (true) {
    // Look for start of cite tag
    const tagStartIndex = state.buffer.indexOf("<cite", searchStart);

    if (tagStartIndex === -1) {
      // No more tags starting - output everything except potential partial tag at end
      // Keep last 100 chars in buffer in case a tag is being built
      const safeOutput = state.buffer.slice(searchStart);

      // Check if we might have a partial tag at the end
      const lastLt = safeOutput.lastIndexOf("<");
      if (lastLt !== -1 && lastLt > safeOutput.length - 100) {
        // Might be a partial tag, buffer it
        displayText += safeOutput.slice(0, lastLt);
        state.buffer = safeOutput.slice(lastLt);
      } else {
        displayText += safeOutput;
        state.buffer = "";
      }
      break;
    }

    // Output text before the tag
    displayText += state.buffer.slice(searchStart, tagStartIndex);

    // Try to find complete tag
    const afterStart = state.buffer.slice(tagStartIndex);
    const endMatch = afterStart.match(/^<cite\s+[^>]*\/>/i);

    if (endMatch) {
      // Complete tag found - extract citation
      const fullTag = endMatch[0];
      const parsed = parseCitation(fullTag);

      if (parsed && parsed.citation && parsed.citation.fullPhrase) {
        const citation = parsed.citation;
        // Assign citation number
        citation.citationNumber = state.citationCounter++;

        // Generate key
        const key = generateCitationKey(citation);

        // Track citation position in clean text
        const position = state.cleanText.length + displayText.length;
        state.citationPositions.push({ position, key });
        state.citations.set(position, { citation, key });
      }

      searchStart = tagStartIndex + fullTag.length;
    } else {
      // Incomplete tag - keep everything from tag start in buffer
      state.buffer = afterStart;
      break;
    }
  }

  // Update accumulated clean text
  state.cleanText += displayText;

  return {
    displayText,
    hasBufferedContent: state.buffer.length > 0,
  };
}

/**
 * Flush any remaining buffered content
 * Call this when the stream is complete
 */
export function flushStreamingParser(state: StreamingParserState): string {
  const remaining = state.buffer;
  state.buffer = "";
  state.cleanText += remaining;
  return remaining;
}

/**
 * Get all extracted citations from the parser
 */
export function getExtractedCitations(
  state: StreamingParserState
): Record<string, Citation> {
  const citations: Record<string, Citation> = {};
  for (const [, { citation, key }] of state.citations) {
    citations[key] = citation;
  }
  return citations;
}

/**
 * Generate the final output with citation markers inserted
 *
 * @param state - Parser state with extracted citations
 * @param foundHighlights - Verification results from DeepCitation API
 * @param options - Formatting options
 * @returns Final text with citation markers
 */
export function generateFinalOutput(
  state: StreamingParserState,
  foundHighlights: Record<string, FoundHighlightLocation>,
  options: FormatCitationOptions = {}
): string {
  const { useColors = true, variant = "brackets" } = options;

  // Sort positions in reverse order so we can insert without shifting indices
  const sortedPositions = [...state.citationPositions].sort(
    (a, b) => b.position - a.position
  );

  let result = state.cleanText;

  for (const { position, key } of sortedPositions) {
    const citationData = state.citations.get(position);
    if (!citationData) continue;

    const { citation } = citationData;
    const foundCitation = foundHighlights[key] ?? null;
    const formatted = formatCitation(citation, foundCitation, {
      useColors,
      variant,
    });

    // Insert citation at position
    result = result.slice(0, position) + formatted + result.slice(position);
  }

  return result;
}

/**
 * Generate a summary of citation verification results
 */
export function generateVerificationSummary(
  state: StreamingParserState,
  foundHighlights: Record<string, FoundHighlightLocation>,
  options: { useColors?: boolean; verbose?: boolean } = {}
): string {
  const { useColors = true, verbose = false } = options;

  const lines: string[] = [];
  lines.push("");
  lines.push("─".repeat(50));

  // Calculate stats
  let verified = 0;
  let partial = 0;
  let missed = 0;
  const total = state.citations.size;

  const citationDetails: string[] = [];

  for (const [, { citation, key }] of state.citations) {
    const foundCitation = foundHighlights[key] ?? null;
    const status = getCitationStatus(foundCitation);

    if (status.isVerified && !status.isPartialMatch) verified++;
    else if (status.isPartialMatch) partial++;
    else if (status.isMiss) missed++;

    if (verbose) {
      const indicator = getStatusIndicator(status, useColors);
      const statusLabel = getStatusLabel(status);
      const num = citation.citationNumber ?? "?";
      const page = citation.pageNumber ? `(p. ${citation.pageNumber})` : "";
      const phrase = citation.fullPhrase
        ? `"${citation.fullPhrase.slice(0, 60)}${citation.fullPhrase.length > 60 ? "…" : ""}"`
        : "";

      citationDetails.push(`${num}. ${indicator} ${statusLabel} ${page}: ${phrase}`);
    }
  }

  // Stats line
  const statsParts: string[] = [];
  if (verified > 0) {
    const text = `${verified} verified`;
    statsParts.push(useColors ? `${ANSI_COLORS.green}${text}${ANSI_COLORS.reset}` : text);
  }
  if (partial > 0) {
    const text = `${partial} partial`;
    statsParts.push(useColors ? `${ANSI_COLORS.yellow}${text}${ANSI_COLORS.reset}` : text);
  }
  if (missed > 0) {
    const text = `${missed} not found`;
    statsParts.push(useColors ? `${ANSI_COLORS.red}${text}${ANSI_COLORS.reset}` : text);
  }

  const header = useColors
    ? `${ANSI_COLORS.bold}Citations:${ANSI_COLORS.reset}`
    : "Citations:";
  lines.push(`${header} ${total} total (${statsParts.join(", ")})`);

  if (verbose && citationDetails.length > 0) {
    lines.push("");
    lines.push(...citationDetails);
  }

  return lines.join("\n");
}

/**
 * One-shot function to process complete LLM output
 * Strips citations and returns clean text + extracted citations
 */
export function parseCompletedOutput(llmOutput: string): {
  cleanText: string;
  citations: Record<string, Citation>;
  citationPositions: Array<{ position: number; key: string }>;
} {
  const state = createStreamingParser();
  processStreamingChunk(state, llmOutput);
  flushStreamingParser(state);

  return {
    cleanText: state.cleanText,
    citations: getExtractedCitations(state),
    citationPositions: state.citationPositions,
  };
}

/**
 * Convenience function to process and format complete output
 */
export function formatCompletedOutput(
  llmOutput: string,
  foundHighlights: Record<string, FoundHighlightLocation>,
  options: FormatCitationOptions & { includeSummary?: boolean; verbose?: boolean } = {}
): string {
  const { includeSummary = true, verbose = false, ...formatOptions } = options;

  const state = createStreamingParser();
  processStreamingChunk(state, llmOutput);
  flushStreamingParser(state);

  let result = generateFinalOutput(state, foundHighlights, formatOptions);

  if (includeSummary) {
    result += generateVerificationSummary(state, foundHighlights, {
      useColors: formatOptions.useColors,
      verbose,
    });
  }

  return result;
}
