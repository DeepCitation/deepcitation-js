import type { DeepTextItem } from "../types/boxes.js";
import { safeSplit } from "../utils/regexSafety.js";

/** Count whitespace-delimited words in a string. */
export function wordCount(s: string): number {
  const trimmed = s.trim();
  if (trimmed.length === 0) return 0;
  return safeSplit(trimmed, /\s+/).length;
}

/** Clamp a number to the range [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Validates that render scale and image dimensions are positive finite numbers.
 * Returns false if any value would cause division by zero or NaN propagation.
 */
export function isValidOverlayGeometry(
  renderScale: { x: number; y: number },
  imageNaturalWidth: number,
  imageNaturalHeight: number,
): boolean {
  return (
    Number.isFinite(renderScale.x) &&
    Number.isFinite(renderScale.y) &&
    renderScale.x > 0 &&
    renderScale.y > 0 &&
    Number.isFinite(imageNaturalWidth) &&
    Number.isFinite(imageNaturalHeight) &&
    imageNaturalWidth > 0 &&
    imageNaturalHeight > 0
  );
}

/**
 * Converts a DeepTextItem (PDF coords) to percentage-based CSS position
 * relative to the image's natural dimensions.
 *
 * PDF y-axis is bottom-up; image y-axis is top-down, so we flip:
 *   imageY = imageNaturalHeight - (item.y * renderScale.y)
 *
 * All outputs are clamped to [0, 100]% to prevent overlays from bleeding
 * outside the image bounds due to rounding errors in PDF coordinates.
 */
export function toPercentRect(
  item: DeepTextItem,
  renderScale: { x: number; y: number },
  imageNaturalWidth: number,
  imageNaturalHeight: number,
): { left: string; top: string; width: string; height: string } | null {
  if (!isValidOverlayGeometry(renderScale, imageNaturalWidth, imageNaturalHeight)) {
    return null;
  }

  // Clamp edges independently so negative PDF coords don't shift the origin
  // while leaving the far edge unbounded.
  const rawX = item.x * renderScale.x;
  const rawY = imageNaturalHeight - item.y * renderScale.y;
  const rawW = item.width * renderScale.x;
  const rawH = item.height * renderScale.y;

  const imgX = clamp(rawX, 0, imageNaturalWidth);
  const imgRight = clamp(rawX + rawW, 0, imageNaturalWidth);
  const imgY = clamp(rawY, 0, imageNaturalHeight);
  const imgBottom = clamp(rawY + rawH, 0, imageNaturalHeight);

  const imgW = imgRight - imgX;
  const imgH = imgBottom - imgY;

  return {
    left: `${(imgX / imageNaturalWidth) * 100}%`,
    top: `${(imgY / imageNaturalHeight) * 100}%`,
    width: `${(imgW / imageNaturalWidth) * 100}%`,
    height: `${(imgH / imageNaturalHeight) * 100}%`,
  };
}

/**
 * Computes the scroll position needed to center a PDF annotation in a
 * scrollable container. Uses the same coordinate transform as `toPercentRect()`
 * (PDF y-axis flip), then applies zoom and centers in the container viewport.
 *
 * Returns `null` for invalid inputs (zero dimensions, non-finite values, or
 * zero/negative zoom).
 */
export function computeAnnotationScrollTarget(
  item: DeepTextItem,
  renderScale: { x: number; y: number },
  imageNaturalWidth: number,
  imageNaturalHeight: number,
  zoom: number,
  containerWidth: number,
  containerHeight: number,
): { scrollLeft: number; scrollTop: number } | null {
  if (!isValidOverlayGeometry(renderScale, imageNaturalWidth, imageNaturalHeight)) {
    return null;
  }
  if (!Number.isFinite(zoom) || zoom <= 0) return null;
  if (!Number.isFinite(containerWidth) || !Number.isFinite(containerHeight)) return null;
  if (containerWidth <= 0 || containerHeight <= 0) return null;

  // Convert PDF coords to image pixel coords (same math as toPercentRect)
  const pixelX = item.x * renderScale.x;
  const pixelY = imageNaturalHeight - item.y * renderScale.y;
  const pixelW = item.width * renderScale.x;
  const pixelH = item.height * renderScale.y;

  // Center of the annotation in zoomed pixel space
  const zoomedCenterX = (pixelX + pixelW / 2) * zoom;
  const zoomedCenterY = (pixelY + pixelH / 2) * zoom;

  // Scroll to center the annotation in the container viewport
  const rawScrollLeft = zoomedCenterX - containerWidth / 2;
  const rawScrollTop = zoomedCenterY - containerHeight / 2;

  // Clamp to valid scroll range
  const maxScrollLeft = Math.max(0, imageNaturalWidth * zoom - containerWidth);
  const maxScrollTop = Math.max(0, imageNaturalHeight * zoom - containerHeight);

  return {
    scrollLeft: clamp(rawScrollLeft, 0, maxScrollLeft),
    scrollTop: clamp(rawScrollTop, 0, maxScrollTop),
  };
}

/**
 * Computes the annotation's center position as percentages of the image
 * dimensions. Used as CSS `transform-origin` so scale animations originate
 * from the annotation location.
 *
 * Returns `null` for invalid inputs.
 */
export function computeAnnotationOriginPercent(
  item: DeepTextItem,
  renderScale: { x: number; y: number },
  imageNaturalWidth: number,
  imageNaturalHeight: number,
): { xPercent: number; yPercent: number } | null {
  if (!isValidOverlayGeometry(renderScale, imageNaturalWidth, imageNaturalHeight)) {
    return null;
  }

  // Convert PDF coords to image pixel coords (same math as toPercentRect)
  const pixelX = item.x * renderScale.x;
  const pixelY = imageNaturalHeight - item.y * renderScale.y;
  const pixelW = item.width * renderScale.x;
  const pixelH = item.height * renderScale.y;

  // Center of the annotation as a percentage of image dimensions
  const centerX = pixelX + pixelW / 2;
  const centerY = pixelY + pixelH / 2;

  return {
    xPercent: clamp((centerX / imageNaturalWidth) * 100, 0, 100),
    yPercent: clamp((centerY / imageNaturalHeight) * 100, 0, 100),
  };
}
