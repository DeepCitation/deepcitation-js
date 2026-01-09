/**
 * Citation Minimal Preset - Tailwind Styled
 *
 * A minimal citation component showing just the number and indicator.
 * Displays citations in the format: 1✓
 *
 * @example
 * ```tsx
 * import { CitationMinimal } from '@deepcitation/deepcitation-js/react/presets'
 *
 * // Renders: 1✓
 * <CitationMinimal
 *   citation={{ citationNumber: 1 }}
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

export interface CitationMinimalProps extends Omit<CitationRootProps, "children"> {
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
   * Style variant
   * @defaultValue "subtle"
   */
  variant?: "subtle" | "bold" | "ghost";
}

/**
 * Minimal citation component - just number and indicator
 *
 * The most compact citation style, showing only essential information.
 * Perfect for dense text or academic-style citations.
 *
 * ## Features
 * - Minimal footprint
 * - Clear verification status
 * - Multiple style variants
 * - Fully accessible
 *
 * ## Variants
 *
 * **Subtle** (default): Light background, small padding
 * ```tsx
 * <CitationMinimal variant="subtle" />
 * ```
 *
 * **Bold**: Stronger colors, more contrast
 * ```tsx
 * <CitationMinimal variant="bold" />
 * ```
 *
 * **Ghost**: No background, just colored text
 * ```tsx
 * <CitationMinimal variant="ghost" />
 * ```
 *
 * @example Basic usage
 * ```tsx
 * <p>
 *   The study found significant results
 *   <CitationMinimal
 *     citation={{ citationNumber: 1 }}
 *     foundCitation={verification}
 *   />.
 * </p>
 * ```
 *
 * @example Academic style
 * ```tsx
 * <p>
 *   Multiple studies
 *   <CitationMinimal citation={{ citationNumber: 1 }} />
 *   <CitationMinimal citation={{ citationNumber: 2 }} />
 *   <CitationMinimal citation={{ citationNumber: 3 }} />
 *   {" "}have shown...
 * </p>
 * ```
 */
export const CitationMinimal = forwardRef<HTMLSpanElement, CitationMinimalProps>(
  (
    {
      citation,
      foundCitation,
      className,
      triggerClassName,
      showIndicator = true,
      onCitationClick,
      onCitationMouseEnter,
      onCitationMouseLeave,
      onCitationTouchEnd,
      isMobile = false,
      disableHover = false,
      size = "default",
      variant = "subtle",
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
      sm: "text-[0.7rem] px-1 py-0 gap-0.5 min-w-[1.25rem]",
      default: "text-xs px-1.5 py-0.5 gap-0.5 min-w-[1.5rem]",
      lg: "text-sm px-2 py-1 gap-1 min-w-[2rem]",
    };

    // Variant classes
    const variantClasses = {
      subtle: cn(
        "rounded",
        // Verified
        "[&.citation-trigger--verified]:bg-blue-50 [&.citation-trigger--verified]:text-blue-700",
        "[&.citation-trigger--verified]:hover:bg-blue-100",
        // Partial
        "[&.citation-trigger--partial]:bg-yellow-50 [&.citation-trigger--partial]:text-yellow-700",
        "[&.citation-trigger--partial]:hover:bg-yellow-100",
        // Miss
        "[&.citation-trigger--miss]:bg-red-50 [&.citation-trigger--miss]:text-red-700",
        "[&.citation-trigger--miss]:hover:bg-red-100",
        // Pending
        "[&.citation-trigger--pending]:bg-gray-50 [&.citation-trigger--pending]:text-gray-500",
        "[&.citation-trigger--pending]:hover:bg-gray-100",
      ),
      bold: cn(
        "rounded font-medium",
        // Verified
        "[&.citation-trigger--verified]:bg-blue-500 [&.citation-trigger--verified]:text-white",
        "[&.citation-trigger--verified]:hover:bg-blue-600",
        // Partial
        "[&.citation-trigger--partial]:bg-yellow-500 [&.citation-trigger--partial]:text-white",
        "[&.citation-trigger--partial]:hover:bg-yellow-600",
        // Miss
        "[&.citation-trigger--miss]:bg-red-500 [&.citation-trigger--miss]:text-white",
        "[&.citation-trigger--miss]:hover:bg-red-600",
        // Pending
        "[&.citation-trigger--pending]:bg-gray-400 [&.citation-trigger--pending]:text-white",
        "[&.citation-trigger--pending]:hover:bg-gray-500",
      ),
      ghost: cn(
        "bg-transparent",
        // Verified
        "[&.citation-trigger--verified]:text-blue-600",
        "[&.citation-trigger--verified]:hover:text-blue-700",
        // Partial
        "[&.citation-trigger--partial]:text-yellow-600",
        "[&.citation-trigger--partial]:hover:text-yellow-700",
        // Miss
        "[&.citation-trigger--miss]:text-red-600",
        "[&.citation-trigger--miss]:hover:text-red-700",
        // Pending
        "[&.citation-trigger--pending]:text-gray-500",
        "[&.citation-trigger--pending]:hover:text-gray-600",
      ),
    };

    // Icon size
    const iconSizeClasses = {
      sm: "w-2 h-2",
      default: "w-2.5 h-2.5",
      lg: "w-3 h-3",
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
        className={cn("inline-flex items-center align-baseline", className)}
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
            "inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",

            // Size
            sizeClasses[size],

            // Variant
            variantClasses[variant],

            // Focus ring colors
            "[&.citation-trigger--verified]:focus-visible:ring-blue-500",
            "[&.citation-trigger--partial]:focus-visible:ring-yellow-500",
            "[&.citation-trigger--miss]:focus-visible:ring-red-500",
            "[&.citation-trigger--pending]:focus-visible:ring-gray-400",

            triggerClassName,
          )}
        >
          <Citation.Number className="tabular-nums leading-none" />
          {showIndicator && (
            <Citation.Indicator
              verifiedIndicator={<CheckIcon className={iconSizeClasses[size]} />}
              partialIndicator={<WarningIcon className={iconSizeClasses[size]} />}
              className="inline-flex items-center leading-none"
            />
          )}
        </Citation.Trigger>
      </Citation.Root>
    );
  },
);

CitationMinimal.displayName = "CitationMinimal";
