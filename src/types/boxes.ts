/**
 * A rectangular region with position and dimensions.
 * Used for bounding boxes, highlights, and selection regions in document space.
 */
export interface ScreenBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A positioned text fragment with bounding box coordinates.
 * Used for OCR text items, phrase matches, and annotation overlays.
 */
export interface DeepTextItem extends ScreenBox {
  text?: string;
}

/**
 * Represents a page in a source document with its metadata and dimensions.
 * Used for tracking page information in multi-page documents.
 */
export interface SourcePage {
  /** Page number (1-indexed) */
  pageNumber: number;
  /** Page dimensions in pixels or PDF units */
  dimensions: {
    width: number;
    height: number;
  };
  /** Source URL for the page image/render */
  imageUrl: string;
  /** Optional base64-encoded thumbnail image (e.g., avif) for quick preview */
  thumbnailUrl?: string;
  /** Optional expiration date for the page data (ISO 8601 string or "never" for enterprise). */
  expiresAt?: string;
}
