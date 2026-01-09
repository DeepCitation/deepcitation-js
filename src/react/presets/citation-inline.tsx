/**
 * Citation Inline Preset - Tailwind Styled
 *
 * A ready-to-use inline citation component without brackets.
 * Displays citations in the format: text✓
 *
 * @example
 * ```tsx
 * import { CitationInline } from '@deepcitation/deepcitation-js/react/presets'
 *
 * // Revenue grew by 25%✓
 * <CitationInline
 *   citation={{ value: "25%", citationNumber: 1 }}
 *   foundCitation={verification}
 * />
 * ```
 */

import React, { forwardRef, type MouseEvent, type TouchEvent } from "react";
import {
  Citation,
  type CitationRootProps,
} from "../primitives.js";
import type { Citation as CitationType } from "../../types/citation.js";
import { cn } from "../cn.js";
import { CheckIcon, WarningIcon } from "../icons.js";

export interface CitationInlineProps extends Omit<CitationRootProps, "children"> {
  /**
   * Custom className for the root element
   */
  className?: string;
  /**
   * Custom className for the trigger element
   */
  triggerClassName?: string;
  /**
   * Whether to show the verification indicator
   * @defaultValue true
   */
  showIndicator?: boolean;
  /**
   * Position of the indicator relative to the value
   * @defaultValue "after"
   */
  indicatorPosition?: "before" | "after";
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
   * Whether to show underline on hover
   * @defaultValue true
   */
  showUnderline?: boolean;
  /**
   * Size variant
   * @defaultValue "default"
   */
  size?: "sm" | "default" | "lg";
}

/**
 * Inline citation component without brackets
 *
 * Perfect for embedding citation values directly in text,
 * like "Revenue grew by 25%✓ year-over-year."
 *
 * ## Features
 * - No brackets, seamless inline text
 * - Subtle color-coding based on verification status
 * - Optional underline on hover
 * - Indicator can be positioned before or after
 *
 * ## Usage Patterns
 *
 * **For values:**
 * ```tsx
 * Revenue grew by <CitationInline citation={{ value: "25%" }} />
 * ```
 *
 * **For cited phrases:**
 * ```tsx
 * <CitationInline citation={{ fullPhrase: "significant growth" }} />
 * ```
 *
 * @example Basic inline value
 * ```tsx
 * <p>
 *   The company achieved{" "}
 *   <CitationInline
 *     citation={{ value: "25% growth", citationNumber: 1 }}
 *     foundCitation={verification}
 *   />{" "}
 *   in Q4.
 * </p>
 * ```
 *
 * @example Indicator before value
 * ```tsx
 * <CitationInline
 *   citation={{ value: "important data" }}
 *   foundCitation={verification}
 *   indicatorPosition="before"
 * />
 * // Renders: ✓important data
 * ```
 */
export const CitationInline = forwardRef<HTMLSpanElement, CitationInlineProps>(
  (
    {
      citation,
      foundCitation,
      className,
      triggerClassName,
      showIndicator = true,
      indicatorPosition = "after",
      onCitationClick,
      onCitationMouseEnter,
      onCitationMouseLeave,
      onCitationTouchEnd,
      isMobile = false,
      disableHover = false,
      showUnderline = true,
      size = "default",
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
      sm: "text-xs gap-0.5",
      default: "text-sm gap-1",
      lg: "text-base gap-1",
    };

    // Indicator size
    const iconSizeClasses = {
      sm: "w-2.5 h-2.5",
      default: "w-3 h-3",
      lg: "w-3.5 h-3.5",
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
        className={cn("inline-flex items-baseline", className)}
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
            "inline-flex items-baseline transition-all duration-150 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:rounded",

            // Underline on hover
            showUnderline && "hover:underline decoration-dotted underline-offset-2",

            // Size
            sizeClasses[size],

            // Status-based text colors
            "[&.citation-trigger--verified]:text-blue-600",
            "[&.citation-trigger--verified]:hover:text-blue-700",
            "[&.citation-trigger--verified]:focus-visible:ring-blue-500",

            "[&.citation-trigger--partial]:text-yellow-600",
            "[&.citation-trigger--partial]:hover:text-yellow-700",
            "[&.citation-trigger--partial]:focus-visible:ring-yellow-500",

            "[&.citation-trigger--miss]:text-red-600",
            "[&.citation-trigger--miss]:hover:text-red-700",
            "[&.citation-trigger--miss]:focus-visible:ring-red-500",

            "[&.citation-trigger--pending]:text-gray-500",
            "[&.citation-trigger--pending]:hover:text-gray-600",
            "[&.citation-trigger--pending]:focus-visible:ring-gray-400",

            triggerClassName,
          )}
        >
          {showIndicator && indicatorPosition === "before" && (
            <Citation.Indicator
              verifiedIndicator={<CheckIcon className={cn(iconSizeClasses[size], "mr-0.5")} />}
              partialIndicator={<WarningIcon className={cn(iconSizeClasses[size], "mr-0.5")} />}
              className="inline-flex items-center"
            />
          )}

          <Citation.Value className="font-medium" />

          {showIndicator && indicatorPosition === "after" && (
            <Citation.Indicator
              verifiedIndicator={<CheckIcon className={cn(iconSizeClasses[size], "ml-0.5")} />}
              partialIndicator={<WarningIcon className={cn(iconSizeClasses[size], "ml-0.5")} />}
              className="inline-flex items-center"
            />
          )}
        </Citation.Trigger>
      </Citation.Root>
    );
  },
);

CitationInline.displayName = "CitationInline";
