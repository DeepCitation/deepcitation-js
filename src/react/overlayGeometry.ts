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
