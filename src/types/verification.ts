import type { DeepTextItem, ScreenBox, SourcePage } from "./boxes.js";
import type { Citation, ImageFormat } from "./citation.js";
import type { SearchAttempt, SearchStatus } from "./search.js";

// ==========================================================================
// Shared utility types
// ==========================================================================

/**
 * An expiration timestamp — either an ISO 8601 date string or `"never"` for non-expiring resources.
 * The `& {}` intersection preserves IDE autocomplete for the `"never"` literal.
 */
export type ExpiresAt = (string & {}) | "never";

/**
 * Default empty verification object.
 * Immutable — cannot be accidentally mutated at runtime.
 */
export const BLANK_VERIFICATION: Verification = Object.freeze({
  status: "not_found",
  attachmentId: null,
});

// ==========================================================================
// File / download artifact types
// ==========================================================================

/**
 * Download link for an artifact file.
 */
export interface DownloadLink {
  url: string;
  /** Optional expiration timestamp for signed links */
  expiresAt?: ExpiresAt;
}

/**
 * Shared file metadata for downloadable artifacts.
 */
export interface FileAsset {
  filename?: string;
  mimeType: string;
  download?: DownloadLink;
}

/**
 * Original user-uploaded file (if one exists).
 */
export interface OriginalFileAsset extends FileAsset {
  origin: "upload";
}

/**
 * Origin of the verification PDF.
 * - `"upload_pdf"`: User uploaded a PDF directly
 * - `"converted_from_office"`: Converted from an Office document (.docx, .xlsx, etc.)
 * - `"converted_from_url"`: Converted from a web page URL
 */
export type PdfOrigin = "upload_pdf" | "converted_from_office" | "converted_from_url";

/**
 * Status of page image generation for an attachment.
 * - `"pending"`: Page images are queued or being generated
 * - `"generating"`: Actively rendering page images (long documents)
 * - `"completed"`: All page images are available
 * - `"failed"`: Page image generation encountered an error
 */
export type PageRendersStatus = "pending" | "generating" | "completed" | "failed";

/**
 * Configuration for proof URL generation.
 * Controls access control, expiry, image format, and inline base64 for proof artifacts.
 * Only used when `generateProofUrls` is `true`.
 */
export interface ProofConfig {
  /** Access control for proof URLs */
  access?: "signed" | "workspace" | "public";
  /** Expiry duration for signed URLs (only used when access is "signed") */
  signedUrlExpiry?: "1h" | "24h" | "7d" | "30d" | "90d" | "1y";
  /** Image format for proof images */
  imageFormat?: ImageFormat;
  /** Whether to also return base64 images inline (in addition to URLs) */
  includeBase64?: boolean;
}

/**
 * PDF used by the verification engine.
 */
export interface VerificationPdfAsset extends FileAsset {
  origin: PdfOrigin;
  /** Present for URL conversions where the verification PDF was derived from a URL. */
  sourceUrl?: string;
}

/**
 * Document file artifacts tied to this verification.
 */
export interface VerificationDocumentAssets {
  /** Original uploaded file (e.g., .docx, .xlsx, .pdf). */
  originalFile?: OriginalFileAsset;
  /** Verification PDF used for page-based extraction and matching. */
  verificationPdf?: VerificationPdfAsset;
}

// ==========================================================================
// Proof / evidence artifact types
// ==========================================================================

/**
 * Interactive proof page artifact.
 */
export interface ProofPageAsset {
  id?: string;
  /** URL to the interactive proof page. Always present when the asset is returned. */
  url: string;
}

/**
 * Hosted proof image artifact.
 */
export interface ProofImageAsset {
  /** URL to the proof image. Always present when the asset is returned. */
  url: string;
  format?: ImageFormat;
  width?: number;
  height?: number;
}

/**
 * Inline snippet evidence artifact (image crop, base64 data URI, or URL).
 */
export interface EvidenceSnippetAsset {
  src?: string;
  dimensions?: { width: number; height: number };
}

/**
 * URL/web capture artifact (screenshot for URL citations).
 */
export interface WebCaptureAsset {
  src?: string;
  /** ISO 8601 timestamp when the capture was taken. */
  capturedAt?: string;
}

/**
 * Content match status for URL/web content verification.
 * Used when verifying that a URL contains what the AI claimed.
 */
export type ContentMatchStatus =
  | "exact"
  | "partial"
  | "mismatch"
  | "not_found"
  | "not_checked"
  | "inconclusive";

/**
 * URL access status for web content verification.
 */
export type UrlAccessStatus =
  | "accessible"
  | "redirected"
  | "redirected_same_domain"
  | "not_found"
  | "forbidden"
  | "server_error"
  | "timeout"
  | "blocked"
  | "network_error"
  | "pending"
  | "unknown";

// ==========================================================================
// Sub-interfaces for type-specific verification results
// ==========================================================================

/**
 * Document-specific verification results.
 * Contains page-level match data for PDF/document citations.
 *
 * @example
 * ```typescript
 * if (verification.document) {
 *   const pageNumber = verification.document.verifiedPageNumber;
 *   const image = verification.assets?.evidenceSnippet?.src;
 *   console.log(`Verified on page ${pageNumber}`);
 * }
 * ```
 */
export interface DocumentVerificationResult {
  verifiedPageNumber?: number;
  verifiedLineIds?: number[];
  /**
   * MIME type of the source attachment (e.g. "application/pdf", "image/jpeg").
   * When set and starting with "image/", page references like "p.1" are
   * replaced with "Image" in the citation popover UI.
   */
  mimeType?: string;
  totalLinesOnPage?: number;
  hitIndexWithinPage?: number;
  phraseMatchDeepItem?: DeepTextItem;
  anchorTextMatchDeepItems?: DeepTextItem[];
}

/**
 * URL-specific verification results.
 * Contains web crawl data, content matching, and metadata for URL citations.
 *
 * @example
 * ```typescript
 * if (verification.url) {
 *   const title = verification.url.verifiedTitle;
 *   const status = verification.url.urlAccessStatus;
 *   console.log(`URL verified: ${title} (${status})`);
 * }
 * ```
 */
export interface UrlVerificationResult {
  verifiedUrl?: string;
  resolvedUrl?: string;
  httpStatus?: number;
  urlAccessStatus?: UrlAccessStatus;
  contentMatchStatus?: ContentMatchStatus;
  contentSimilarity?: number;
  verifiedTitle?: string;
  actualContentSnippet?: string;
  /** ISO 8601 timestamp when the URL was crawled. */
  crawledAt?: string;
  urlVerificationError?: string;
  verifiedDomain?: string;
  verifiedDescription?: string;
  verifiedFaviconUrl?: string;
  verifiedSiteName?: string;
  verifiedAuthor?: string;
  /** ISO 8601 timestamp when the content was published. */
  verifiedPublishedAt?: string;
  verifiedImageUrl?: string;
  contentType?: string;
}

/**
 * A page render returned from verification for user inspection.
 * Extends SourcePage from boxes.ts with verification-specific metadata.
 */
export interface PageRenderAsset extends SourcePage {
  /** Whether this page contains the verified citation match */
  isMatchPage?: boolean;
  /** Highlighted region on this page (if match found) */
  highlightBox?: ScreenBox;
  /** Scale factors from PDF coordinate units to page image pixels.
   *  Use to convert DeepTextItem coords: imageX = item.x * renderScale.x */
  renderScale?: { x: number; y: number };
  /** OCR text items on this page (forward-compatible: text selection, annotations) */
  textItems?: DeepTextItem[];
}

/**
 * Verification artifacts grouped by user intent.
 *
 * @example
 * ```typescript
 * if (verification.assets?.proofPage?.url) {
 *   const proofLink = verification.assets.proofPage.url;
 *   const image = verification.assets.proofImage?.url;
 *   console.log(`Proof available at: ${proofLink}`);
 * }
 * ```
 */
export interface VerificationAssets {
  /** Source/converted files associated with the verification flow */
  documentFiles?: VerificationDocumentAssets;
  /** Interactive proof page (HTML) */
  proofPage?: ProofPageAsset;
  /** Hosted proof image (CDN/full-page image) */
  proofImage?: ProofImageAsset;
  /** Inline evidence snippet (crop image) */
  evidenceSnippet?: EvidenceSnippetAsset;
  /** Web screenshot capture for URL citations */
  webCapture?: WebCaptureAsset;
  /** Renderable page images for inspection and drawer views */
  pageRenders?: PageRenderAsset[];
}

// ==========================================================================
// Main Verification interface
// ==========================================================================

export interface Verification {
  // ========== Identity ==========
  /** Attachment ID. Null for URL citations without a backing attachment. */
  attachmentId?: string | null;

  /** Display label for the attachment (e.g., "Invoice") */
  label?: string;

  /** The original citation being verified */
  citation?: Citation;

  // ========== Search ==========
  /** Verification status. Every verification has a status. */
  status?: SearchStatus;

  /** Ordered list of search attempts made during verification */
  searchAttempts?: SearchAttempt[];

  /** Custom highlight color override */
  highlightColor?: string;

  // ========== Shared verified text results ==========
  verifiedTimestamps?: { startTime?: string; endTime?: string };

  verifiedFullPhrase?: string;

  verifiedAnchorText?: string;

  verifiedMatchSnippet?: string;

  /** ISO 8601 timestamp when verification completed */
  verifiedAt?: string;

  // ========== Type-specific results ==========
  /** Document-specific verification results */
  document?: DocumentVerificationResult;

  /** URL-specific verification results */
  url?: UrlVerificationResult;

  /** Verification artifacts grouped by user intent */
  assets?: VerificationAssets;

  // ========== Timing ==========
  /** Wall-clock ms the system took to verify this citation.
   *  Computed client-side: (evidence ready timestamp) − (citation first rendered timestamp). */
  timeToCertaintyMs?: number;

  // ========== Ambiguity Detection ==========
  /** Ambiguity information when multiple occurrences of the text exist */
  ambiguity?: {
    /** Total number of occurrences found in the document */
    totalOccurrences: number;
    /** Number of occurrences on the expected page */
    occurrencesOnExpectedPage: number;
    /** Confidence level in the matched occurrence */
    confidence: "high" | "medium" | "low";
    /** Human-readable note about the ambiguity */
    note: string;
  };
}
