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
