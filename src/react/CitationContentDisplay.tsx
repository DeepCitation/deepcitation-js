/**
 * Citation content display — variant rendering logic.
 *
 * Contains all variant-specific rendering (chip, superscript, text, badge,
 * linter, brackets) plus the utility functions they share.
 *
 * @packageDocumentation
 */

import type React from "react";
import type { CitationStatus } from "../types/citation.js";
import { CitationStatusIndicator, type CitationStatusIndicatorProps } from "./CitationStatusIndicator.js";
import { MISS_WAVY_UNDERLINE_STYLE } from "./constants.js";
import type { BaseCitationProps, CitationContent, CitationRenderProps, CitationVariant } from "./types.js";
import { cn, isUrlCitation } from "./utils.js";

// =============================================================================
// MODULE-LEVEL UTILITIES
// =============================================================================

/**
 * Module-level handler for hiding broken images.
 * Performance fix: avoids creating new function references on every render.
 */
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
  (e.target as HTMLImageElement).style.display = "none";
};

/** Variants that handle their own hover styling (don't need parent hover) */
// biome-ignore lint/style/useComponentExportOnlyModules: utility constant exported alongside component
export const VARIANTS_WITH_OWN_HOVER = new Set<CitationVariant>(["chip", "badge", "linter", "superscript"]);

/**
 * Get status-aware hover classes for contained hover styling.
 * Used by chip, superscript, and other variants that need hover contained within their bounds.
 *
 * @param isVerified - Whether the citation is verified
 * @param isPartialMatch - Whether it's a partial match
 * @param isMiss - Whether it's not found
 * @param shouldShowSpinner - Whether to show loading spinner
 * @param opacity - Opacity level for hover backgrounds:
 *   - 15 (default): Used for contained variants (chip, superscript) where hover is
 *     applied directly to the element. Higher opacity provides better visual feedback
 *     since the element itself is the hover target.
 *   - 10: Used for the outer trigger wrapper on variants without contained hover.
 *     Lower opacity is more subtle since the wrapper may extend beyond the visual element.
 * @returns Array of Tailwind class strings for hover states
 */
// biome-ignore lint/style/useComponentExportOnlyModules: utility function exported alongside component
export function getStatusHoverClasses(
  isVerified: boolean,
  isPartialMatch: boolean,
  isMiss: boolean,
  shouldShowSpinner: boolean,
  opacity: 10 | 15 = 15,
): (string | false)[] {
  const opacitySuffix = opacity === 10 ? "/10" : "/15";
  return [
    isVerified &&
      !isPartialMatch &&
      !shouldShowSpinner &&
      `hover:bg-green-600${opacitySuffix} dark:hover:bg-green-500${opacitySuffix}`,
    isPartialMatch &&
      !shouldShowSpinner &&
      `hover:bg-amber-500${opacitySuffix} dark:hover:bg-amber-500${opacitySuffix}`,
    isMiss && !shouldShowSpinner && `hover:bg-red-500${opacitySuffix} dark:hover:bg-red-400${opacitySuffix}`,
    (shouldShowSpinner || (!isVerified && !isMiss && !isPartialMatch)) && "hover:bg-gray-200 dark:hover:bg-gray-700",
  ];
}

/**
 * Get the default content type based on variant.
 */
// biome-ignore lint/style/useComponentExportOnlyModules: utility function exported alongside component
export function getDefaultContent(variant: CitationVariant): CitationContent {
  switch (variant) {
    case "chip":
    case "text":
    case "brackets":
    case "linter":
      return "anchorText";
    case "badge":
      return "source";
    default:
      return "number";
  }
}

/**
 * Strip leading/trailing brackets from text.
 * Handles cases where LLM output includes brackets in anchorText.
 */
// biome-ignore lint/style/useComponentExportOnlyModules: utility function exported alongside component
export function stripBrackets(text: string): string {
  return text.replace(/^\[+\s*/, "").replace(/\s*\]+$/, "");
}

/**
 * Get display text based on content type and citation data.
 * Returns "1" as fallback if no citation number is available.
 */
// biome-ignore lint/style/useComponentExportOnlyModules: utility function exported alongside component
export function getDisplayText(
  citation: BaseCitationProps["citation"],
  content: CitationContent,
  fallbackDisplay?: string | null,
): string {
  if (content === "indicator") {
    return "";
  }

  if (content === "anchorText") {
    const raw = citation.anchorText?.toString() || citation.citationNumber?.toString() || fallbackDisplay || "1";
    return stripBrackets(raw);
  }

  if (content === "source") {
    // Source content: show siteName or domain (URL citations only)
    if (isUrlCitation(citation)) {
      return citation.siteName || citation.domain || citation.anchorText?.toString() || "Source";
    }
    return citation.anchorText?.toString() || "Source";
  }

  // content === "number"
  return citation.citationNumber?.toString() || "1";
}

// =============================================================================
// CITATION CONTENT DISPLAY COMPONENT
// =============================================================================

export interface CitationContentDisplayProps {
  renderContent?: (props: CitationRenderProps) => React.ReactNode;
  citation: CitationRenderProps["citation"];
  status: CitationStatus;
  citationKey: string;
  displayText: string;
  resolvedContent: CitationContent;
  variant: CitationVariant;
  statusClasses: string;
  isVerified: boolean;
  isPartialMatch: boolean;
  isMiss: boolean;
  shouldShowSpinner: boolean;
  showIndicator: boolean;
  faviconUrl?: string;
  additionalCount?: number;
  indicatorProps: CitationStatusIndicatorProps;
}

/**
 * Renders the citation content based on the selected variant (chip, superscript, text, badge, linter, brackets).
 * Each variant has its own visual treatment and hover behavior.
 */
export const CitationContentDisplay = ({
  renderContent,
  citation,
  status,
  citationKey,
  displayText,
  resolvedContent,
  variant,
  statusClasses,
  isVerified,
  isPartialMatch,
  isMiss,
  shouldShowSpinner,
  showIndicator,
  faviconUrl,
  additionalCount,
  indicatorProps,
}: CitationContentDisplayProps): React.ReactNode => {
  const indicator = <CitationStatusIndicator {...indicatorProps} />;

  if (renderContent) {
    return renderContent({
      citation,
      status,
      citationKey,
      displayText,
      isMergedDisplay: resolvedContent === "anchorText",
    });
  }

  // Content type: indicator only
  if (resolvedContent === "indicator") {
    return <span>{indicator}</span>;
  }

  // Variant: chip (pill/badge style with neutral gray background)
  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full text-[0.9em] font-normal transition-colors",
          "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
          ...getStatusHoverClasses(isVerified, isPartialMatch, isMiss, shouldShowSpinner),
        )}
      >
        <span
          className={cn(
            "max-w-60 overflow-hidden text-ellipsis whitespace-nowrap",
            isMiss && !shouldShowSpinner && "opacity-70",
          )}
        >
          {displayText}
        </span>
        {indicator}
      </span>
    );
  }

  // Variant: superscript (footnote style)
  if (variant === "superscript") {
    const anchorTextDisplay = citation.anchorText?.toString() || "";
    const citationNumber = citation.citationNumber?.toString() || "1";

    const supStatusClasses = cn(
      !shouldShowSpinner && "text-gray-700 dark:text-gray-200",
      shouldShowSpinner && "text-gray-500 dark:text-gray-400",
    );
    return (
      <>
        {anchorTextDisplay && <span className="font-normal">{anchorTextDisplay}</span>}
        <sup
          className={cn(
            "font-medium transition-colors px-0.5 rounded",
            supStatusClasses,
            ...getStatusHoverClasses(isVerified, isPartialMatch, isMiss, shouldShowSpinner),
          )}
          style={{ fontSize: "0.65em", lineHeight: 0, position: "relative", top: "-0.65em", verticalAlign: "baseline" }}
        >
          [<span>{citationNumber}</span>
          {indicator}]
        </sup>
      </>
    );
  }

  // Variant: text
  if (variant === "text") {
    return (
      <span className={cn("font-normal", statusClasses)}>
        {displayText}
        {indicator}
      </span>
    );
  }

  // Variant: badge (ChatGPT-style source chip)
  if (variant === "badge") {
    const faviconSrc = faviconUrl || (isUrlCitation(citation) ? citation.faviconUrl : undefined);
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          "transition-colors cursor-pointer",
          isVerified && !isPartialMatch && !shouldShowSpinner && "hover:bg-green-600/10 dark:hover:bg-green-500/10",
          isPartialMatch && !shouldShowSpinner && "hover:bg-amber-500/10 dark:hover:bg-amber-500/10",
          isMiss && !shouldShowSpinner && "hover:bg-red-500/10 dark:hover:bg-red-400/10",
          (shouldShowSpinner || (!isVerified && !isMiss && !isPartialMatch)) &&
            "hover:bg-gray-200 dark:hover:bg-gray-700",
        )}
      >
        {faviconSrc && (
          <img
            src={faviconSrc}
            alt=""
            className="w-4 h-4 rounded-sm object-contain"
            loading="lazy"
            onError={handleImageError}
          />
        )}
        <span
          className={cn(
            "max-w-40 overflow-hidden text-ellipsis whitespace-nowrap",
            isMiss && !shouldShowSpinner && "opacity-70",
          )}
          style={isMiss && !shouldShowSpinner ? MISS_WAVY_UNDERLINE_STYLE : undefined}
        >
          {displayText}
        </span>
        {additionalCount !== undefined && additionalCount > 0 && (
          <span className="text-gray-500 dark:text-gray-400">+{additionalCount}</span>
        )}
        {indicator}
      </span>
    );
  }

  // Variant: linter
  if (variant === "linter") {
    const isVerifiedState = isVerified && !isPartialMatch && !shouldShowSpinner;
    const isPartialState = isPartialMatch && !shouldShowSpinner;
    const isMissState = isMiss && !shouldShowSpinner;
    const isPendingState = shouldShowSpinner;

    const linterStyles: React.CSSProperties = {
      textDecoration: "underline",
      textDecorationThickness: "2px",
      textUnderlineOffset: "3px",
      borderRadius: "2px",
      color: "inherit",
      fontSize: "inherit",
      fontFamily: "inherit",
      lineHeight: "inherit",
    };

    if (isMissState) {
      linterStyles.textDecorationStyle = "wavy";
      linterStyles.textDecorationColor = "var(--dc-linter-error, #c0605f)";
    } else if (isPartialState) {
      linterStyles.textDecorationStyle = "dashed";
      linterStyles.textDecorationColor = "var(--dc-linter-warning, #f59e0b)";
    } else if (isVerifiedState) {
      linterStyles.textDecorationStyle = "solid";
      linterStyles.textDecorationColor = "var(--dc-linter-success, #4a7c5f)";
    } else {
      linterStyles.textDecorationStyle = "dotted";
      linterStyles.textDecorationColor = "var(--dc-linter-pending, #9ca3af)";
    }

    const linterClasses = cn(
      "cursor-pointer font-normal",
      isVerifiedState && "hover:bg-green-600/10 dark:hover:bg-green-500/10",
      isPartialState && "hover:bg-amber-500/10 dark:hover:bg-amber-500/10",
      isMissState && "hover:bg-red-500/10 dark:hover:bg-red-400/10",
      isPendingState && "bg-gray-500/[0.05] hover:bg-gray-500/10 dark:bg-gray-400/[0.05] dark:hover:bg-gray-400/10",
    );

    return (
      <span className={linterClasses} style={linterStyles}>
        {displayText}
        {showIndicator && indicator}
      </span>
    );
  }

  // Variant: brackets (default)
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-0.5 whitespace-nowrap",
        "font-mono font-normal text-xs leading-tight",
        "text-gray-500 dark:text-gray-400",
        "transition-colors",
      )}
      aria-hidden="true"
    >
      [
      <span className={cn("max-w-80 overflow-hidden text-ellipsis", statusClasses)}>
        {displayText}
        {indicator}
      </span>
      ]
    </span>
  );
};
