import React, { forwardRef, memo, useCallback, useMemo } from "react";
import type { Citation } from "../types/citation.js";
import type { UrlCitationMeta, UrlCitationProps, UrlFetchStatus } from "./types.js";
import { classNames, generateCitationInstanceId, generateCitationKey } from "./utils.js";

/**
 * Extracts domain from URL for compact display.
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    // Fallback for invalid URLs
    return url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
  }
}

/**
 * Truncates a string to max length with ellipsis.
 */
function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Get path from URL for display.
 */
function getUrlPath(url: string): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search;
    return path === "/" ? "" : path;
  } catch {
    return "";
  }
}

/**
 * Status indicator icons for URL fetch states.
 */
const STATUS_ICONS: Record<UrlFetchStatus, { icon: string; label: string; className: string }> = {
  verified: { icon: "✓", label: "Verified", className: "url-citation--verified" },
  partial: { icon: "~", label: "Partial match", className: "url-citation--partial" },
  pending: { icon: "…", label: "Verifying", className: "url-citation--pending" },
  blocked_antibot: { icon: "🛡", label: "Blocked by anti-bot", className: "url-citation--blocked" },
  blocked_login: { icon: "🔒", label: "Login required", className: "url-citation--blocked" },
  blocked_paywall: { icon: "💳", label: "Paywall", className: "url-citation--blocked" },
  blocked_geo: { icon: "🌍", label: "Geo-restricted", className: "url-citation--blocked" },
  blocked_rate_limit: { icon: "⏱", label: "Rate limited", className: "url-citation--blocked" },
  error_timeout: { icon: "⏰", label: "Timed out", className: "url-citation--error" },
  error_not_found: { icon: "404", label: "Not found", className: "url-citation--error" },
  error_server: { icon: "⚠", label: "Server error", className: "url-citation--error" },
  error_network: { icon: "⚡", label: "Network error", className: "url-citation--error" },
  unknown: { icon: "?", label: "Unknown status", className: "url-citation--unknown" },
};

/**
 * Checks if status is a blocked status.
 */
export function isBlockedStatus(status: UrlFetchStatus): boolean {
  return status.startsWith("blocked_");
}

/**
 * Checks if status is an error status.
 */
export function isErrorStatus(status: UrlFetchStatus): boolean {
  return status.startsWith("error_");
}

/**
 * Checks if URL was successfully verified.
 */
export function isVerifiedStatus(status: UrlFetchStatus): boolean {
  return status === "verified" || status === "partial";
}

/**
 * Default blocked indicator component.
 */
const DefaultBlockedIndicator = ({ status, errorMessage }: { status: UrlFetchStatus; errorMessage?: string }) => {
  const statusInfo = STATUS_ICONS[status];
  return (
    <span
      className={classNames("url-citation__blocked-indicator", statusInfo.className)}
      title={errorMessage || statusInfo.label}
      aria-label={statusInfo.label}
    >
      <span className="url-citation__blocked-icon" aria-hidden="true">
        {statusInfo.icon}
      </span>
    </span>
  );
};

/**
 * Default favicon component.
 */
const DefaultFavicon = ({ url, faviconUrl }: { url: string; faviconUrl?: string }) => {
  const domain = extractDomain(url);
  const src = faviconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

  return (
    <img
      src={src}
      alt=""
      className="url-citation__favicon"
      width={14}
      height={14}
      loading="lazy"
      onError={e => {
        // Hide broken favicon images
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
};

/**
 * URL Citation Component
 *
 * Displays a URL citation with compact domain display,
 * verification status, and blocked/error indicators.
 *
 * @example
 * ```tsx
 * <UrlCitationComponent
 *   urlMeta={{
 *     url: "https://example.com/article",
 *     fetchStatus: "verified",
 *   }}
 * />
 * // Renders: [example.com ✓]
 *
 * <UrlCitationComponent
 *   urlMeta={{
 *     url: "https://protected-site.com/page",
 *     fetchStatus: "blocked_login",
 *   }}
 * />
 * // Renders: [protected-site.com 🔒]
 * ```
 */
export const UrlCitationComponent = forwardRef<HTMLSpanElement, UrlCitationProps>(
  (
    {
      urlMeta,
      citation: providedCitation,
      children,
      className,
      variant = "chip", // Default to chip for URLs
      showFullUrlOnHover = true,
      showFavicon = true,
      showTitle = false,
      maxDisplayLength = 30,
      renderBlockedIndicator,
      onUrlClick,
      eventHandlers,
      preventTooltips = false,
    },
    ref,
  ) => {
    const { url, domain: providedDomain, title, fetchStatus, faviconUrl, errorMessage } = urlMeta;

    // Derive citation from URL meta if not provided
    const citation: Citation = useMemo(
      () =>
        providedCitation || {
          value: url,
          fullPhrase: title || url,
        },
      [providedCitation, url, title],
    );

    const citationKey = useMemo(() => generateCitationKey(citation), [citation]);
    const citationInstanceId = useMemo(() => generateCitationInstanceId(citationKey), [citationKey]);

    // Compute display text
    const domain = useMemo(() => providedDomain || extractDomain(url), [providedDomain, url]);
    const path = useMemo(() => getUrlPath(url), [url]);

    const displayText = useMemo(() => {
      if (showTitle && title) {
        return truncateString(title, maxDisplayLength);
      }
      // Show domain + truncated path
      const pathPart = path ? truncateString(path, maxDisplayLength - domain.length - 1) : "";
      return pathPart ? `${domain}${pathPart}` : domain;
    }, [showTitle, title, domain, path, maxDisplayLength]);

    const statusInfo = STATUS_ICONS[fetchStatus];
    const isBlocked = isBlockedStatus(fetchStatus);
    const isError = isErrorStatus(fetchStatus);
    const isVerified = fetchStatus === "verified";
    const isPartial = fetchStatus === "partial";
    const isPending = fetchStatus === "pending";

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (onUrlClick) {
          onUrlClick(url, e);
        } else {
          // Default: open URL in new tab
          window.open(url, "_blank", "noopener,noreferrer");
        }
        eventHandlers?.onClick?.(citation, citationKey, e);
      },
      [onUrlClick, url, eventHandlers, citation, citationKey],
    );

    const handleMouseEnter = useCallback(() => {
      eventHandlers?.onMouseEnter?.(citation, citationKey);
    }, [eventHandlers, citation, citationKey]);

    const handleMouseLeave = useCallback(() => {
      eventHandlers?.onMouseLeave?.(citation, citationKey);
    }, [eventHandlers, citation, citationKey]);

    const renderStatusIndicator = () => {
      if (isBlocked || isError) {
        if (renderBlockedIndicator) {
          return renderBlockedIndicator(fetchStatus, errorMessage);
        }
        return <DefaultBlockedIndicator status={fetchStatus} errorMessage={errorMessage} />;
      }

      if (isVerified) {
        return (
          <span className="url-citation__verified-icon" aria-hidden="true" title="Verified">
            ✓
          </span>
        );
      }

      if (isPartial) {
        return (
          <span className="url-citation__partial-icon" aria-hidden="true" title="Partial match">
            ~
          </span>
        );
      }

      if (isPending) {
        return (
          <span className="url-citation__pending" aria-hidden="true">
            …
          </span>
        );
      }

      return null;
    };

    // Choose variant-specific rendering
    if (variant === "chip") {
      return (
        <>
          {children}
          <span
            ref={ref}
            data-citation-id={citationKey}
            data-citation-instance={citationInstanceId}
            data-url={url}
            data-fetch-status={fetchStatus}
            className={classNames("url-citation", "url-citation--chip", statusInfo.className, className)}
            title={showFullUrlOnHover ? url : undefined}
            onMouseEnter={preventTooltips ? undefined : handleMouseEnter}
            onMouseLeave={preventTooltips ? undefined : handleMouseLeave}
            onMouseDown={handleClick}
            onClick={e => e.stopPropagation()}
            role="link"
            aria-label={`Link to ${domain}: ${statusInfo.label}`}
          >
            {showFavicon && <DefaultFavicon url={url} faviconUrl={faviconUrl} />}
            <span className="url-citation__domain">{displayText}</span>
            {renderStatusIndicator()}
          </span>
        </>
      );
    }

    // Inline variant
    if (variant === "inline") {
      return (
        <>
          {children}
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={url}
            data-citation-id={citationKey}
            data-citation-instance={citationInstanceId}
            data-fetch-status={fetchStatus}
            className={classNames("url-citation", "url-citation--inline", statusInfo.className, className)}
            title={showFullUrlOnHover ? url : undefined}
            onMouseEnter={preventTooltips ? undefined : handleMouseEnter}
            onMouseLeave={preventTooltips ? undefined : handleMouseLeave}
            onClick={e => {
              e.preventDefault();
              handleClick(e as unknown as React.MouseEvent<HTMLSpanElement>);
            }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Link to ${domain}: ${statusInfo.label}`}
          >
            {showFavicon && <DefaultFavicon url={url} faviconUrl={faviconUrl} />}
            <span className="url-citation__text">{displayText}</span>
            {renderStatusIndicator()}
          </a>
        </>
      );
    }

    // Bracket variant (default for non-URL citations)
    return (
      <>
        {children}
        <span
          ref={ref}
          data-citation-id={citationKey}
          data-citation-instance={citationInstanceId}
          data-url={url}
          data-fetch-status={fetchStatus}
          className={classNames("url-citation", "url-citation--bracket", statusInfo.className, className)}
          title={showFullUrlOnHover ? url : undefined}
          onMouseEnter={preventTooltips ? undefined : handleMouseEnter}
          onMouseLeave={preventTooltips ? undefined : handleMouseLeave}
          onMouseDown={handleClick}
          onClick={e => e.stopPropagation()}
          role="link"
          aria-label={`Link to ${domain}: ${statusInfo.label}`}
        >
          [{showFavicon && <DefaultFavicon url={url} faviconUrl={faviconUrl} />}
          <span className="url-citation__domain">{displayText}</span>
          {renderStatusIndicator()}]
        </span>
      </>
    );
  },
);

UrlCitationComponent.displayName = "UrlCitationComponent";

/**
 * Memoized version for performance.
 */
export const MemoizedUrlCitationComponent = memo(UrlCitationComponent);

/**
 * Hook to parse URL and create UrlCitationMeta.
 */
export function useUrlMeta(
  url: string,
  fetchStatus: UrlFetchStatus = "unknown",
  additionalMeta?: Partial<UrlCitationMeta>,
): UrlCitationMeta {
  return useMemo(
    () => ({
      url,
      domain: extractDomain(url),
      fetchStatus,
      ...additionalMeta,
    }),
    [url, fetchStatus, additionalMeta],
  );
}

/**
 * Compact URL display utilities.
 */
export const urlDisplayUtils = {
  extractDomain,
  truncateString,
  getUrlPath,
  isBlockedStatus,
  isErrorStatus,
  isVerifiedStatus,
};

/**
 * Status configuration for custom styling.
 */
export { STATUS_ICONS };
