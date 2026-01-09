/**
 * Citation Superscript Preset - Tailwind Styled
 *
 * Academic-style superscript citation component.
 * Displays citations in the format: ¹
 *
 * @example
 * ```tsx
 * import { CitationSuperscript } from '@deepcitation/deepcitation-js/react/presets'
 *
 * // Renders: text¹
 * <CitationSuperscript
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

export interface CitationSuperscriptProps extends Omit<CitationRootProps, "children"> {
  /**
   * Custom className for the root element
   */
  className?: string;
  /**
   * Custom className for the trigger element
   */
  triggerClassName?: string;
  /**
   * Whether to show brackets around the superscript
   * @defaultValue false
   */
  showBrackets?: boolean;
  /**
   * Opening bracket character (if showBrackets is true)
   * @defaultValue "["
   */
  openBracket?: string;
  /**
   * Closing bracket character (if showBrackets is true)
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
   * Style variant
   * @defaultValue "default"
   */
  variant?: "default" | "colored";
}

/**
 * Superscript citation component for academic-style citations
 *
 * Renders citations as superscript numbers, commonly used in
 * scientific papers, research articles, and academic writing.
 *
 * ## Features
 * - Standard superscript positioning
 * - Optional brackets [¹]
 * - Color-coded by verification status
 * - Accessible with proper ARIA labels
 *
 * ## Variants
 *
 * **Default**: Subtle hover effect, no background
 * ```tsx
 * <CitationSuperscript variant="default" />
 * ```
 *
 * **Colored**: Shows verification status with colors
 * ```tsx
 * <CitationSuperscript variant="colored" />
 * ```
 *
 * @example Basic academic citation
 * ```tsx
 * <p>
 *   This finding has been replicated multiple times
 *   <CitationSuperscript
 *     citation={{ citationNumber: 1 }}
 *     foundCitation={verification}
 *   />
 *   in various contexts.
 * </p>
 * ```
 *
 * @example With brackets
 * ```tsx
 * <CitationSuperscript
 *   citation={{ citationNumber: 1 }}
 *   foundCitation={verification}
 *   showBrackets
 * />
 * // Renders: [¹]
 * ```
 *
 * @example Multiple citations
 * ```tsx
 * <p>
 *   Studies show
 *   <CitationSuperscript citation={{ citationNumber: 1 }} />
 *   <sup>,</sup>
 *   <CitationSuperscript citation={{ citationNumber: 2 }} />
 *   <sup>,</sup>
 *   <CitationSuperscript citation={{ citationNumber: 3 }} />
 *   {" "}that...
 * </p>
 * ```
 */
export const CitationSuperscript = forwardRef<HTMLSpanElement, CitationSuperscriptProps>(
  (
    {
      citation,
      foundCitation,
      className,
      triggerClassName,
      showBrackets = false,
      openBracket = "[",
      closeBracket = "]",
      onCitationClick,
      onCitationMouseEnter,
      onCitationMouseLeave,
      onCitationTouchEnd,
      isMobile = false,
      disableHover = false,
      variant = "default",
      displayCitationValue,
      fallbackDisplay,
      pendingContent,
      searchState,
      ...props
    },
    ref,
  ) => {
    const variantClasses = {
      default: cn(
        "text-current hover:text-blue-600 transition-colors",
      ),
      colored: cn(
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
        "[&.citation-trigger--pending]:text-gray-400",
        "[&.citation-trigger--pending]:hover:text-gray-500",
      ),
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
        className={cn("inline-flex items-start", className)}
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
            // Superscript positioning
            "align-super text-[0.75em] leading-none",
            "cursor-pointer select-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:rounded",

            // Variant styles
            variantClasses[variant],

            // Focus ring colors
            "focus-visible:ring-blue-500",
            "[&.citation-trigger--partial]:focus-visible:ring-yellow-500",
            "[&.citation-trigger--miss]:focus-visible:ring-red-500",
            "[&.citation-trigger--pending]:focus-visible:ring-gray-400",

            triggerClassName,
          )}
        >
          {showBrackets && (
            <Citation.Bracket
              open={openBracket}
              close={closeBracket}
              className="inline-flex items-center"
            >
              <Citation.Number className="font-normal tabular-nums" />
            </Citation.Bracket>
          )}
          {!showBrackets && (
            <Citation.Number className="font-normal tabular-nums" />
          )}
        </Citation.Trigger>
      </Citation.Root>
    );
  },
);

CitationSuperscript.displayName = "CitationSuperscript";
