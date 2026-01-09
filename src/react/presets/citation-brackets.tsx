/**
 * Citation Brackets Preset - Tailwind Styled
 *
 * A ready-to-use citation component with bracket styling.
 * Displays citations in the format: [1✓]
 *
 * @example
 * ```tsx
 * import { CitationBrackets } from '@deepcitation/deepcitation-js/react/presets'
 *
 * <CitationBrackets
 *   citation={citation}
 *   foundCitation={verification}
 *   onCitationClick={(c) => console.log('Clicked', c)}
 * />
 * ```
 */

import React, { forwardRef, type MouseEvent, type TouchEvent } from "react";
import {
  Citation,
  type CitationRootProps,
  type CitationTriggerProps,
} from "../primitives.js";
import type { Citation as CitationType } from "../../types/citation.js";
import { cn } from "../cn.js";
import { CheckIcon, WarningIcon } from "../icons.js";

export interface CitationBracketsProps extends Omit<CitationRootProps, "children"> {
  /**
   * Custom className for the root element
   */
  className?: string;
  /**
   * Custom className for the trigger element
   */
  triggerClassName?: string;
  /**
   * Custom className for the bracket wrapper
   */
  bracketClassName?: string;
  /**
   * Whether to show the verification indicator (✓, *, etc.)
   * @defaultValue true
   */
  showIndicator?: boolean;
  /**
   * Opening bracket character
   * @defaultValue "["
   */
  openBracket?: string;
  /**
   * Closing bracket character
   * @defaultValue "]"
   */
  closeBracket?: string;
  /**
   * Callback when citation is clicked
   */
  onCitationClick?: (citation: CitationType, citationKey: string, event: MouseEvent<HTMLSpanElement>) => void;
  /**
   * Callback when mouse enters citation
   */
  onCitationMouseEnter?: (citation: CitationType, citationKey: string) => void;
  /**
   * Callback when mouse leaves citation
   */
  onCitationMouseLeave?: (citation: CitationType, citationKey: string) => void;
  /**
   * Callback for touch events (mobile)
   */
  onCitationTouchEnd?: (citation: CitationType, citationKey: string, event: TouchEvent<HTMLSpanElement>) => void;
  /**
   * Whether this is a mobile device
   * @defaultValue false
   */
  isMobile?: boolean;
  /**
   * Disable hover interactions
   * @defaultValue false
   */
  disableHover?: boolean;
  /**
   * Size variant
   * @defaultValue "default"
   */
  size?: "sm" | "default" | "lg";
  /**
   * Color variant - overrides status colors
   */
  variant?: "default" | "primary" | "secondary" | "accent";
}

/**
 * Citation component with brackets [1✓]
 *
 * A Tailwind-styled preset that displays citations in brackets with
 * automatic verification status indicators.
 *
 * ## Features
 * - Auto color-coding based on verification status
 * - Responsive hover/touch interactions
 * - Customizable brackets and indicators
 * - Multiple size variants
 * - Fully accessible
 *
 * ## Status Colors
 * - Verified: Blue background with green checkmark
 * - Partial match: Yellow background with warning icon
 * - Not found: Red background
 * - Pending: Gray background
 *
 * @example Basic usage
 * ```tsx
 * <CitationBrackets
 *   citation={{ citationNumber: 1, fullPhrase: "Example text" }}
 *   foundCitation={verificationResult}
 * />
 * ```
 *
 * @example Custom styling
 * ```tsx
 * <CitationBrackets
 *   citation={citation}
 *   foundCitation={verification}
 *   size="lg"
 *   className="font-bold"
 *   triggerClassName="hover:scale-110 transition-transform"
 * />
 * ```
 *
 * @example Custom brackets
 * ```tsx
 * <CitationBrackets
 *   citation={citation}
 *   foundCitation={verification}
 *   openBracket="("
 *   closeBracket=")"
 * />
 * // Renders: (1✓)
 * ```
 */
export const CitationBrackets = forwardRef<HTMLSpanElement, CitationBracketsProps>(
  (
    {
      citation,
      foundCitation,
      className,
      triggerClassName,
      bracketClassName,
      showIndicator = true,
      openBracket = "[",
      closeBracket = "]",
      onCitationClick,
      onCitationMouseEnter,
      onCitationMouseLeave,
      onCitationTouchEnd,
      isMobile = false,
      disableHover = false,
      size = "default",
      variant = "default",
      displayCitationValue,
      fallbackDisplay,
      pendingContent,
      searchState,
      ...props
    },
    ref,
  ) => {
    // Size classes
    const sizeClasses = {
      sm: "text-xs px-1 py-0.5 gap-0.5",
      default: "text-sm px-1.5 py-0.5 gap-0.5",
      lg: "text-base px-2 py-1 gap-1",
    };

    // Variant classes (for custom color schemes)
    const variantClasses = {
      default: "",
      primary: "bg-blue-50 text-blue-700 hover:bg-blue-100",
      secondary: "bg-gray-50 text-gray-700 hover:bg-gray-100",
      accent: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    };

    return (
      <Citation.Root
        ref={ref}
        citation={citation}
        foundCitation={foundCitation}
        searchState={searchState}
        displayCitationValue={displayCitationValue}
        fallbackDisplay={fallbackDisplay}
        pendingContent={pendingContent}
        className={cn("inline-flex items-center", className)}
        {...props}
      >
        <Citation.Trigger
          onCitationClick={onCitationClick}
          onCitationMouseEnter={onCitationMouseEnter}
          onCitationMouseLeave={onCitationMouseLeave}
          onCitationTouchEnd={onCitationTouchEnd}
          isMobile={isMobile}
          disableHover={disableHover}
          className={cn(
            // Base styles
            "inline-flex items-center rounded transition-all duration-150 cursor-pointer select-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",

            // Size
            sizeClasses[size],

            // Variant override or status-based colors
            variant !== "default"
              ? variantClasses[variant]
              : cn(
                  // Status-based colors (data attributes set by primitives)
                  "[&.citation-trigger--verified]:bg-blue-50 [&.citation-trigger--verified]:text-blue-700",
                  "[&.citation-trigger--verified]:hover:bg-blue-100",
                  "[&.citation-trigger--verified]:focus-visible:ring-blue-500",

                  "[&.citation-trigger--partial]:bg-yellow-50 [&.citation-trigger--partial]:text-yellow-700",
                  "[&.citation-trigger--partial]:hover:bg-yellow-100",
                  "[&.citation-trigger--partial]:focus-visible:ring-yellow-500",

                  "[&.citation-trigger--miss]:bg-red-50 [&.citation-trigger--miss]:text-red-700",
                  "[&.citation-trigger--miss]:hover:bg-red-100",
                  "[&.citation-trigger--miss]:focus-visible:ring-red-500",

                  "[&.citation-trigger--pending]:bg-gray-50 [&.citation-trigger--pending]:text-gray-500",
                  "[&.citation-trigger--pending]:hover:bg-gray-100",
                  "[&.citation-trigger--pending]:focus-visible:ring-gray-400",
                ),

            triggerClassName,
          )}
        >
          <Citation.Bracket
            open={openBracket}
            close={closeBracket}
            className={cn("inline-flex items-center gap-0.5", bracketClassName)}
          >
            <Citation.Number className="font-medium tabular-nums" />
            {showIndicator && (
              <Citation.Indicator
                verifiedIndicator={<CheckIcon className="w-3 h-3" />}
                partialIndicator={<WarningIcon className="w-3 h-3" />}
                className="inline-flex items-center"
              />
            )}
          </Citation.Bracket>
        </Citation.Trigger>
      </Citation.Root>
    );
  },
);

CitationBrackets.displayName = "CitationBrackets";
