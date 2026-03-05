/**
 * Type definitions for DeepCitation
 *
 * @packageDocumentation
 */

// Box/geometry types
export type { DeepTextItem, ScreenBox, SourcePage } from "./boxes.js";
export type {
  Citation,
  CitationBase,
  CitationStatus,
  DocumentCitation,
  ImageFormat,
  ProofOptions,
  UrlCitation,
  VerifyCitationRequest,
  VerifyCitationResponse,
} from "./citation.js";
// Citation core types
export { DEFAULT_OUTPUT_IMAGE_FORMAT, isDocumentCitation, isUrlCitation } from "./citation.js";
// Search status types
export type {
  MatchedVariation,
  SearchAttempt,
  SearchMethod,
  SearchStatus,
} from "./search.js";
// Found highlight types
export type {
  ContentMatchStatus,
  DocumentVerificationResult,
  DownloadLink,
  EvidenceSnippetAsset,
  ExpiresAt,
  FileAsset,
  OriginalFileAsset,
  PageRenderAsset,
  PageRendersStatus,
  PdfOrigin,
  ProofConfig,
  ProofImageAsset,
  ProofPageAsset,
  UrlAccessStatus,
  UrlVerificationResult,
  Verification,
  VerificationAssets,
  VerificationDocumentAssets,
  VerificationPdfAsset,
  WebCaptureAsset,
} from "./verification.js";
export { BLANK_VERIFICATION } from "./verification.js";
