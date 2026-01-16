import { sha1Hash } from "../utils/sha.js";
import { type Citation } from "./citation.js";
import { type SearchStatus, type SearchAttempt } from "./search.js";
import { type PdfSpaceItem } from "./boxes.js";

export const NOT_FOUND_VERIFICATION_INDEX = -1;
export const PENDING_VERIFICATION_INDEX = -2;

export const BLANK_VERIFICATION: Verification = {
  attachmentId: null,
  pageNumber: NOT_FOUND_VERIFICATION_INDEX,
  matchSnippet: null,
  citation: {
    pageNumber: NOT_FOUND_VERIFICATION_INDEX,
  },
  status: "not_found",
};

export function deterministicIdFromVerification(
  verification: Verification
): string {
  return sha1Hash(
    `${verification.label}-${verification.attachmentId}-${verification.pageNumber}-${verification.hitIndexWithinPage}-${verification.matchSnippet}-${verification?.hitIndexWithinPage}`
  );
}

export interface Verification {
  attachmentId?: string | null;

  label?: string | null; //e.g. "Invoice"

  citation?: Citation;

  // Search status (moved from SearchState)
  status?: SearchStatus | null;

  // Search attempts (moved from SearchState)
  searchAttempts?: SearchAttempt[];

  highlightColor?: string | null;

  // Actual results (i.e. not expected - expected values are in citation)
  pageNumber?: number | null;

  lineIds?: number[] | null;

  timestamps?: { startTime?: string; endTime?: string } | null;

  hitIndexWithinPage?: number | null;

  matchSnippet?: string | null;

  pdfSpaceItem?: PdfSpaceItem;

  verificationImageBase64?: string | null;

  verifiedAt?: Date;
}
