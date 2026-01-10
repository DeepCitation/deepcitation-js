/**
 * CLI utilities for DeepCitation
 * Provides text-based formatting for terminal/CLI environments
 * @packageDocumentation
 */

// Formatting functions
export {
  formatCitation,
  formatCitationDetails,
  formatResponseWithCitations,
  formatCitationSummaryTable,
  formatMarkdownCitation,
  formatMarkdownFootnotes,
  stripCitationTags,
  getStatusIndicator,
  getStatusLabel,
  CITATION_INDICATORS,
  ANSI_COLORS,
} from "./formatCitation.js";

export type {
  FormatCitationOptions,
  FormatResponseOptions,
  FormattedResponse,
} from "./formatCitation.js";

// Streaming parser
export {
  createStreamingParser,
  processStreamingChunk,
  flushStreamingParser,
  getExtractedCitations,
  generateFinalOutput,
  generateVerificationSummary,
  parseCompletedOutput,
  formatCompletedOutput,
} from "./streamingCitationParser.js";

export type {
  StreamingParserState,
  ChunkResult,
} from "./streamingCitationParser.js";
