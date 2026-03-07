/**
 * Type definitions for DeepCitation
 *
 * @packageDocumentation
 */

// Box/geometry types
export type { DeepTextItem, ScreenBox } from "./boxes.js";
export type {
  Citation,
  CitationStatus,
  DocumentCitation,
  ImageFormat,
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
  EvidenceImage,
  FileDownload,
  PageImage,
  PageImagesStatus,
  UrlAccessStatus,
  UrlVerificationResult,
  Verification,
} from "./verification.js";
