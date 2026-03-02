import type React from "react";
import { useLayoutEffect, useRef } from "react";
import { EASE_EXPAND, POPOVER_MORPH_EXPAND_MS } from "../constants.js";
import type { PopoverViewState } from "../DefaultPopoverContent.js";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

type RectSnapshot = { left: number; top: number; width: number; height: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getOriginPercent(
  triggerRect: DOMRect | undefined,
  popoverRect: RectSnapshot,
): { xPercent: number; yPercent: number } {
  if (!triggerRect) return { xPercent: 50, yPercent: 50 };

  const x = triggerRect.left + triggerRect.width / 2;
  const y = triggerRect.top + triggerRect.height / 2;
  const xPercent = clamp(((x - popoverRect.left) / popoverRect.width) * 100, 0, 100);
  const yPercent = clamp(((y - popoverRect.top) / popoverRect.height) * 100, 0, 100);
  return { xPercent, yPercent };
}

/**
 * FLIP morph for popover view-state transitions.
 * Layout dimensions still snap; this hook animates the visual delta (x/y/scale)
 * so transitions feel coordinated and originate from the trigger center.
 */
export function usePopoverMorphTransition(
  isOpen: boolean,
  viewState: PopoverViewState,
  triggerRef: React.RefObject<HTMLElement | null>,
  popoverContentRef: React.RefObject<HTMLElement | null>,
): void {
  const prefersReducedMotion = usePrefersReducedMotion();
  const prevRectRef = useRef<RectSnapshot | null>(null);
  const prevViewStateRef = useRef<PopoverViewState | null>(null);
  const suppressNextKeyholeFlipRef = useRef(false);
  const rafIdRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    const el = popoverContentRef.current;
    if (!isOpen || !el) {
      cancelAnimationFrame(rafIdRef.current);
      cleanupRef.current?.();
      cleanupRef.current = null;
      prevRectRef.current = null;
      prevViewStateRef.current = null;
      suppressNextKeyholeFlipRef.current = false;
      return;
    }

    // If a prior FLIP is still active (rapid state toggle), clear our inline
    // transform first so measurements are taken from settled layout geometry.
    cleanupRef.current?.();
    cleanupRef.current = null;

    const rect = el.getBoundingClientRect();
    const currentRect: RectSnapshot = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    const prevRect = prevRectRef.current;
    const prevViewState = prevViewStateRef.current;

    // Record baseline on first open or same-state re-renders.
    if (!prevRect || !prevViewState || prevViewState === viewState) {
      prevRectRef.current = currentRect;
      prevViewStateRef.current = viewState;
      return;
    }

    // Update snapshots first so rapid toggles always animate from latest geometry.
    prevRectRef.current = currentRect;
    prevViewStateRef.current = viewState;

    // Any transition away from expanded-page can involve async re-positioning.
    // Suppress the *next* summary->keyhole FLIP so we don't animate from a
    // transient top-left frame before Radix settles.
    if (prevViewState === "expanded-page" && viewState === "summary") {
      suppressNextKeyholeFlipRef.current = true;
      return;
    }

    // Stability-first scope: animate only the initial summary -> keyhole expand.
    // All collapse/back/full-page transitions snap to avoid unstable trajectories.
    if (!(prevViewState === "summary" && viewState === "expanded-keyhole")) {
      return;
    }
    if (suppressNextKeyholeFlipRef.current) {
      suppressNextKeyholeFlipRef.current = false;
      return;
    }

    if (
      prefersReducedMotion ||
      currentRect.width <= 0 ||
      currentRect.height <= 0 ||
      prevRect.width <= 0 ||
      prevRect.height <= 0
    ) {
      return;
    }

    const scaleX = prevRect.width / currentRect.width;
    const scaleY = prevRect.height / currentRect.height;
    // Translation must compensate for non-top-left transform-origin.
    // For origin O: left' = left + (1 - s) * O + t  =>  t = prevLeft - left - (1 - s) * O
    const { xPercent, yPercent } = getOriginPercent(triggerRef.current?.getBoundingClientRect(), currentRect);
    const originX = (xPercent / 100) * currentRect.width;
    const originY = (yPercent / 100) * currentRect.height;
    const dx = prevRect.left - currentRect.left - (1 - scaleX) * originX;
    const dy = prevRect.top - currentRect.top - (1 - scaleY) * originY;

    const nearlyIdentity =
      Math.abs(scaleX - 1) < 0.01 && Math.abs(scaleY - 1) < 0.01 && Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5;
    if (nearlyIdentity) return;

    const duration = POPOVER_MORPH_EXPAND_MS;
    const easing = EASE_EXPAND;

    cancelAnimationFrame(rafIdRef.current);

    el.style.willChange = "transform";
    el.style.transition = "none";
    el.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;

    // Force style flush so the next frame transitions from inverted -> identity.
    el.getBoundingClientRect();

    const onEnd = (event: TransitionEvent) => {
      if (event.propertyName !== "transform") return;
      el.removeEventListener("transitionend", onEnd);
      el.style.transition = "";
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.willChange = "";
      cleanupRef.current = null;
    };

    cleanupRef.current = () => {
      el.removeEventListener("transitionend", onEnd);
      el.style.transition = "";
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.willChange = "";
    };

    rafIdRef.current = requestAnimationFrame(() => {
      el.addEventListener("transitionend", onEnd);
      el.style.transition = `transform ${duration}ms ${easing}`;
      el.style.transform = "translate(0px, 0px) scale(1, 1)";
    });

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [isOpen, viewState, popoverContentRef, triggerRef, prefersReducedMotion]);
}
