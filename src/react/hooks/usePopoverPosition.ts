/**
 * Popover positioning hook for expanded-page mode.
 *
 * Computes a sideOffset that positions the popover at 1rem from viewport top.
 * floating-ui's shift middleware only shifts on the main axis (horizontal for
 * side="bottom"), not vertically. This hook uses the offset middleware instead
 * by computing the exact vertical offset needed.
 *
 * Recalculates on scroll/resize to handle trigger position changes from
 * content reflow, virtual keyboard, or scroll events.
 *
 * @packageDocumentation
 */

import { type RefObject, useCallback, useLayoutEffect, useState } from "react";
import type { PopoverViewState } from "../DefaultPopoverContent.js";

const VIEWPORT_MARGIN = 16; // 1rem

export interface UsePopoverPositionOptions {
  /** Current popover view state */
  viewState: PopoverViewState;
  /** Ref to the trigger element for positioning calculations */
  triggerRef: RefObject<HTMLElement | null>;
}

export interface UsePopoverPositionResult {
  /** Side offset for the popover, or undefined for default positioning */
  sideOffset: number | undefined;
}

/**
 * Computes popover side offset for expanded-page mode.
 *
 * Uses `useLayoutEffect` to run after DOM commit but before paint,
 * so the offset is applied before the popover is visible. Recalculates
 * on scroll/resize to keep the offset current if the trigger moves.
 */
export function usePopoverPosition({ viewState, triggerRef }: UsePopoverPositionOptions): UsePopoverPositionResult {
  const [sideOffset, setSideOffset] = useState<number | undefined>(undefined);

  const recalculate = useCallback(() => {
    if (viewState !== "expanded-page") return;
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    if (!triggerRect) return;
    // For side="bottom": popover.top = trigger.bottom + sideOffset
    // We want popover.top = VIEWPORT_MARGIN
    setSideOffset(VIEWPORT_MARGIN - triggerRect.bottom);
  }, [viewState, triggerRef]);

  useLayoutEffect(() => {
    if (viewState !== "expanded-page") {
      setSideOffset(undefined);
      return;
    }
    recalculate();

    // Recalculate if the trigger moves due to scroll or window resize.
    window.addEventListener("scroll", recalculate, { passive: true });
    window.addEventListener("resize", recalculate, { passive: true });
    return () => {
      window.removeEventListener("scroll", recalculate);
      window.removeEventListener("resize", recalculate);
    };
  }, [viewState, recalculate]);

  return { sideOffset };
}
