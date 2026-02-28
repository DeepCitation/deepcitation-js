import type React from "react";
import { useLayoutEffect, useState } from "react";
import type { PopoverViewState } from "../DefaultPopoverContent.js";

/**
 * Computes an alignOffset that prevents the popover from overflowing the
 * viewport horizontally. With avoidCollisions={false}, Radix's shift middleware
 * is disabled — this hook replaces it for the horizontal axis.
 *
 * Isolated into its own hook because `setState` inside `useLayoutEffect`
 * causes the React Compiler to bail out — keeping this in CitationComponent
 * would prevent the compiler from optimizing the entire component.
 *
 * Uses useLayoutEffect (runs before paint) so the offset is applied before the
 * popover is visible — no flash of wrong position.
 *
 * Math (with align="center"):
 *   idealLeft  = triggerCenter - popoverWidth / 2
 *   idealRight = triggerCenter + popoverWidth / 2
 *   If idealLeft  < MARGIN → shift right:  offset = MARGIN - idealLeft
 *   If idealRight > vw - MARGIN → shift left: offset = (vw - MARGIN) - idealRight
 */
export function usePopoverAlignOffset(
  isOpen: boolean,
  popoverViewState: PopoverViewState,
  triggerRef: React.RefObject<HTMLSpanElement | null>,
  popoverContentRef: React.RefObject<HTMLElement | null>,
): number {
  const [offset, setOffset] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: triggerRef and popoverContentRef have stable identity — refs should not be in deps per React docs
  useLayoutEffect(() => {
    if (!isOpen) {
      setOffset(0);
      return;
    }

    const triggerRect = triggerRef.current?.getBoundingClientRect();
    const popoverEl = popoverContentRef.current;
    if (!triggerRect || !popoverEl) {
      setOffset(0);
      return;
    }

    const MARGIN = 16; // 1rem — matches viewport margin used elsewhere
    const viewportWidth = window.innerWidth;
    const popoverWidth = popoverEl.getBoundingClientRect().width;
    const triggerCenter = triggerRect.left + triggerRect.width / 2;

    // Where the popover edges would sit with align="center" and no offset.
    // This computation is independent of the current alignOffset, so
    // the effect converges in a single pass without oscillation.
    const idealLeft = triggerCenter - popoverWidth / 2;
    const idealRight = triggerCenter + popoverWidth / 2;

    if (idealLeft < MARGIN) {
      setOffset(MARGIN - idealLeft);
    } else if (idealRight > viewportWidth - MARGIN) {
      setOffset(viewportWidth - MARGIN - idealRight);
    } else {
      setOffset(0);
    }
  }, [isOpen, popoverViewState]);

  return offset;
}
