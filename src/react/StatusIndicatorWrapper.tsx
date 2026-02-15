import type React from "react";
import type { ReactNode } from "react";
import { ERROR_COLOR_STYLE, INDICATOR_SIZE_STYLE } from "./constants.js";

/**
 * Shared wrapper component for icon-based status indicators.
 * Provides consistent sizing, centering, and color styling across all citation variants.
 *
 * @example
 * ```tsx
 * <StatusIndicatorWrapper>
 *   <XIcon />
 * </StatusIndicatorWrapper>
 * ```
 */
export interface StatusIndicatorWrapperProps {
  /** The icon element to wrap (e.g., XIcon, CheckIcon, etc.) */
  children: ReactNode;
  /** Optional color style override (defaults to ERROR_COLOR_STYLE) */
  colorStyle?: React.CSSProperties;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional data attribute for testing/debugging */
  dataIndicator?: string;
}

export const StatusIndicatorWrapper = ({
  children,
  colorStyle = ERROR_COLOR_STYLE,
  className = "",
  dataIndicator,
}: StatusIndicatorWrapperProps) => (
  <span
    className={`ml-0.5 shrink-0 inline-flex items-center justify-center ${className}`.trim()}
    style={{ ...INDICATOR_SIZE_STYLE, ...colorStyle }}
    aria-hidden="true"
    {...(dataIndicator && { "data-dc-indicator": dataIndicator })}
  >
    {children}
  </span>
);
