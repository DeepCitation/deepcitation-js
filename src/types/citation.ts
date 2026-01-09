import { type ScreenBox } from "./boxes";
import { type FoundHighlightLocation } from "./foundHighlight";

export const VERIFICATION_VERSION_NUMBER = "0.4.37";

export type OutputImageFormat = "jpeg" | "png" | "avif" | undefined | null;

export const DEFAULT_OUTPUT_IMAGE_FORMAT = "avif" as const;
export interface VerifyCitationResponse {
  foundHighlights: { [key: string]: FoundHighlightLocation };
}

export interface VerifyCitationRequest {
  fileId: string;
  citations: { [key: string]: Citation };
  outputImageFormat?: OutputImageFormat;
  apiKey?: string; // Optional API key for authentication
}

export interface Citation {
  //should be populated automatically via getCitationPageNumber
  fileId?: string;
  fullPhrase?: string | null;
  value?: string | null;
  startPageKey?: string | null;
  pageNumber?: number | null;
  lineIds?: number[] | null;
  reasoning?: string | null;
  selection?: ScreenBox | null;
  citationNumber?: number;

  // for audio/video citations
  timestamps?: {
    endTime?: string;
    startTime?: string;
  };

  fragmentContext?: string | null;
  rawCitationMd?: string;
  beforeCite?: string;

  formFieldName?: string | null;
  formFieldValue?: string | null;
}

export interface CitationStatus {
  isVerified: boolean;
  isMiss: boolean;
  isPartialMatch: boolean;
  isPending: boolean;
}
