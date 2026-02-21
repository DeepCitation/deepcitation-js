import { useEffect, useState } from "react";

/**
 * Detect whether the current device uses a coarse (touch) primary pointer.
 * Uses `(pointer: coarse)` media query as primary method, which specifically
 * identifies devices where the PRIMARY input is coarse (touch), avoiding false
 * positives on Windows laptops with touchscreens but mouse as primary input.
 */
function getIsTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)").matches ?? false;
}

/**
 * React hook that detects touch devices and listens for pointer capability changes.
 * Uses useState + useEffect for React 17+ compatibility.
 *
 * Returns `true` when the primary pointing device is coarse (touch).
 * Listens for media query changes so it reacts to tablet mode switches.
 */
export function useIsTouchDevice(): boolean {
  // Initialize with current value (SSR-safe: defaults to false on server)
  const [isTouchDevice, setIsTouchDevice] = useState(() => getIsTouchDevice());

  useEffect(() => {
    // Listen for changes in pointer capability (e.g., tablet mode changes)
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(pointer: coarse)");
      const handleChange = () => setIsTouchDevice(getIsTouchDevice());
      mediaQuery.addEventListener?.("change", handleChange);
      return () => mediaQuery.removeEventListener?.("change", handleChange);
    }
  }, []);

  return isTouchDevice;
}
