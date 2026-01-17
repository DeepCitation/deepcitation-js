import { type ScreenBox } from "./boxes.js";
import { type Verification } from "./verification.js";

export type OutputImageFormat = "jpeg" | "png" | "avif" | undefined | null;

export const DEFAULT_OUTPUT_IMAGE_FORMAT = "avif" as const;
export interface VerifyCitationResponse {
  verifications: { [key: string]: Verification };
}

export interface VerifyCitationRequest {
  attachmentId: string;
  citations: { [key: string]: Citation };
  outputImageFormat?: OutputImageFormat;
  apiKey?: string; // Optional API key for authentication
}

/**
 * Web source metadata for URL-based citations (Gemini-style).
 * Used when citing web pages, articles, videos, etc.
 */
export interface WebSource {
  /** The full URL of the source */
  url: string;
  /** Display domain (e.g., "example.com", "fitandwell.com") */
  domain?: string;
  /** Page/article title */
  title?: string;
  /** Brief description or snippet from the page */
  description?: string;
  /** Favicon URL for the source */
  faviconUrl?: string;
  /** Platform name (e.g., "Twitch", "YouTube", "Reddit") */
  platform?: string;
  /** Author name if available */
  author?: string;
  /** Publication date */
  publishedAt?: Date | string;
  /** Open Graph or social media image URL */
  imageUrl?: string;
  /** Site name (e.g., "Fit&Well", "Garage Gym Reviews") */
  siteName?: string;
}

export interface Citation {
  attachmentId?: string;
  fullPhrase?: string | null;
  keySpan?: string | null;

  startPageKey?: string | null;

  lineIds?: number[] | null;
  reasoning?: string | null;
  selection?: ScreenBox | null;
  citationNumber?: number;

  //should be populated automatically via getCitationPageNumber
  pageNumber?: number | null;

  // for audio/video citations
  timestamps?: {
    endTime?: string;
    startTime?: string;
  };

  beforeCite?: string;

  /** Web source metadata for URL-based citations */
  webSource?: WebSource;
}

export interface CitationStatus {
  isVerified: boolean;
  isMiss: boolean;
  isPartialMatch: boolean;
  isPending: boolean;
}

/**
 * Extended citation type for Anthropic-style web search citations.
 * Includes URL, title, and source metadata for aggregated sources display.
 *
 * Maps to existing Citation fields:
 * - `fullPhrase` = the context/excerpt from the source
 * - `keySpan` = the specific cited text (the key phrase being referenced)
 */
export interface SourceCitation extends Citation {
  /** The source URL */
  url?: string;
  /** Page/document title (e.g., "Q4 Financial Report") */
  title?: string;
  /** Display domain (e.g., "example.com") */
  domain?: string;
  /** Platform/source type for grouping and display */
  sourceType?: SourceType;
  /** Favicon URL if available */
  faviconUrl?: string;
  /** When the source was accessed/verified */
  accessedAt?: Date | string;
}

/**
 * Source/platform type for categorization and display.
 * Used for icon selection and grouping in sources lists.
 */
export type SourceType =
  | "web" // Generic web page
  | "pdf" // PDF document
  | "document" // Uploaded document
  | "social" // Social media (X/Twitter, Facebook, etc.)
  | "video" // Video platforms (YouTube, Twitch, etc.)
  | "news" // News articles
  | "academic" // Academic papers/journals
  | "code" // Code repositories (GitHub, etc.)
  | "forum" // Forums/discussion boards (Reddit, etc.)
  | "commerce" // E-commerce sites
  | "reference" // Reference sites (Wikipedia, etc.)
  | "unknown"; // Unknown/other

/**
 * Metadata for a source in an aggregated sources list.
 * Used by SourcesListComponent to display collected citations.
 */
export interface SourceMeta {
  /** Unique identifier for this source */
  id: string;
  /** The source URL */
  url: string;
  /** Page/document title */
  title: string;
  /** Display domain without www prefix */
  domain: string;
  /** Platform/source type */
  sourceType?: SourceType;
  /** Favicon URL */
  faviconUrl?: string;
  /** Citation numbers that reference this source */
  citationNumbers?: number[];
  /** Number of times this source is cited */
  citationCount?: number;
  /** Relevant excerpts/quotes from this source */
  excerpts?: string[];
  /** Verification status if verified */
  verificationStatus?: "verified" | "partial" | "pending" | "failed" | "unknown";
  /** When the source was accessed */
  accessedAt?: Date | string;
}
