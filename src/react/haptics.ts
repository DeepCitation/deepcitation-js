/**
 * Haptic feedback utilities for mobile interactions.
 *
 * ## Internal — not part of the public package API
 *
 * This module is consumed directly by CitationComponent. The public-facing
 * surface is the `experimentalHaptics` prop on CitationComponent. These
 * utilities are not exported from src/react/index.ts per the no-re-export
 * rule in CLAUDE.md; callers within the package import from this file directly.
 *
 * ## Haptics Guide — keeping feedback tasteful
 *
 * ### When to fire
 * - Discrete "confirm" moments only: expanding to full-screen, collapsing back.
 * - Drag threshold crossings (see useDrawerDragToClose — uses 10ms).
 *
 * ### When NOT to fire
 * - Automatic/programmatic state changes (e.g. pending → verified, data load).
 * - During scroll or continuous drag gestures — only at the moment of release
 *   or threshold crossing, never during the gesture itself.
 * - When another haptic fired within the last 300ms (they blur into noise).
 * - When prefers-reduced-motion: reduce is set (checked at call time below).
 *   Haptics are an analog of animation intensity and respect the same preference.
 *   Note: the Vibration API does NOT enforce this automatically — it is a manual
 *   check that must be performed before calling navigator.vibrate().
 * - On desktop — navigator.vibrate is mobile-only and a no-op there anyway.
 *
 * ### Duration guide
 * - 10ms  "light"    — subtle acknowledgment (drawer drag threshold pattern)
 * - 12ms  "medium"   — clear forward confirmation (expand to full-screen)
 * - 10ms  "collapse" — gentler than expand; user is going back, not forward
 * - 25ms  "heavy"    — reserved for errors/destructive; do not use for info
 *
 * Never exceed 25ms for informational feedback.
 * Never chain two haptics within 300ms.
 *
 * @packageDocumentation
 */

export type HapticEvent = "expand" | "collapse";

const HAPTIC_MS: Record<HapticEvent, number> = {
  expand: 12,
  collapse: 10,
};

// Global timestamp — intentionally shared across all citation instances.
// If two citation components fire within 300ms of each other (e.g., the user
// rapidly taps different citations), a single haptic pulse is enough. Multiple
// rapid pulses would blur into unpleasant noise and feel like a bug.
let lastHapticAt = 0;
const HAPTIC_MIN_GAP_MS = 300;

/**
 * Fire haptic feedback for a named interaction event.
 *
 * No-ops when:
 * - The Vibration API is unavailable (SSR, desktop, unsupported browsers).
 * - Called within 300ms of a previous haptic (global debounce).
 * - `prefers-reduced-motion: reduce` is set by the user.
 */
export function triggerHaptic(event: HapticEvent): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastHapticAt < HAPTIC_MIN_GAP_MS) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  lastHapticAt = now;
  navigator.vibrate?.(HAPTIC_MS[event]);
}
