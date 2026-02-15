/**
 * URL safety utilities to prevent domain spoofing and subdomain attacks.
 *
 * Substring-based domain matching (e.g., "url.includes('twitter.com')") is vulnerable
 * to attacks like "twitter.com.evil.com" or "twіtter.com" (homograph attack with
 * Unicode lookalikes). This module provides safe URL parsing and domain validation.
 *
 * @module utils/urlSafety
 */

/**
 * Safely extract the domain from a URL.
 * Uses the URL constructor for proper parsing and normalization.
 *
 * @param url - The URL string to parse
 * @returns The hostname (with www. prefix removed), lowercased, or empty string if invalid
 *
 * @example
 * ```typescript
 * extractDomain('https://www.twitter.com/user'); // 'twitter.com'
 * extractDomain('https://mobile.twitter.com');    // 'twitter.com'
 * extractDomain('invalid://url');                  // ''
 * ```
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    // Normalize to lowercase and remove www prefix for comparison
    return urlObj.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    // Return empty string if URL is invalid
    return "";
  }
}

/**
 * Common multi-part TLDs (country code + second-level domain).
 * Used to correctly extract root domains from URLs like bbc.co.uk.
 * @private
 */
const MULTI_PART_TLDS = new Set([
  "co.uk",
  "co.nz",
  "co.jp",
  "co.in",
  "co.id",
  "co.th",
  "co.za",
  "com.au",
  "com.br",
  "com.mx",
  "com.ar",
  "gov.uk",
  "gov.au",
  "ac.uk",
  "ac.nz",
  "org.uk",
  "org.au",
  "com.hk",
]);

/**
 * Extract root domain, accounting for multi-part TLDs.
 * For example:
 * - example.com → example.com
 * - www.example.com → example.com
 * - mobile.example.co.uk → example.co.uk
 * @private
 */
function extractRootDomain(hostname: string): string {
  const parts = hostname.split(".");

  if (parts.length < 2) {
    return hostname;
  }

  // Check if last 3 parts form a known multi-part TLD (e.g., co.uk)
  if (parts.length >= 3) {
    const lastThreeParts = parts.slice(-3).join(".");
    if (MULTI_PART_TLDS.has(lastThreeParts.slice(lastThreeParts.indexOf(".") + 1))) {
      // Found multi-part TLD, include it with one more part for the domain name
      return parts.slice(-3).join(".");
    }
  }

  // Default: last two parts (domain + TLD)
  return parts.slice(-2).join(".");
}

/**
 * Check if a URL matches a specific domain exactly.
 * Supports main domain and direct subdomains (e.g., mobile.twitter.com matches twitter.com).
 * Handles multi-part TLDs like co.uk correctly.
 *
 * Does NOT match:
 * - Subdomain spoofing: twitter.com.evil.com
 * - Homograph attacks: twіtter.com (with Unicode characters)
 *
 * @param url - The URL to check
 * @param domain - The domain to match against (e.g., 'twitter.com' or 'bbc.co.uk')
 * @returns True if URL matches the domain exactly or is a direct subdomain
 *
 * @example
 * ```typescript
 * isDomainMatch('https://twitter.com/user', 'twitter.com');        // true
 * isDomainMatch('https://mobile.twitter.com', 'twitter.com');      // true
 * isDomainMatch('https://bbc.co.uk', 'bbc.co.uk');                 // true
 * isDomainMatch('https://mobile.bbc.co.uk', 'bbc.co.uk');          // true
 * isDomainMatch('https://twitter.com.evil.com', 'twitter.com');    // false
 * isDomainMatch('https://bbc.co.uk.evil.com', 'bbc.co.uk');        // false
 * ```
 */
export function isDomainMatch(url: string, domain: string): boolean {
  const extracted = extractDomain(url);

  // Check for exact match
  if (extracted === domain) {
    return true;
  }

  // Extract the root domain from the extracted hostname, accounting for multi-part TLDs
  const rootDomain = extractRootDomain(extracted);
  return rootDomain === domain;
}

/**
 * Detect the source type from a URL using safe domain matching.
 * This replaces substring matching which is vulnerable to spoofing.
 *
 * @param url - The source URL
 * @returns The detected source type
 *
 * @example
 * ```typescript
 * detectSourceType('https://twitter.com/user');           // 'social'
 * detectSourceType('https://youtube.com/watch?v=...');    // 'video'
 * detectSourceType('https://github.com/user/repo');       // 'code'
 * detectSourceType('https://example.com');                // 'web'
 * detectSourceType('https://twitter.com.evil.com');       // 'web' (not 'social')
 * ```
 */
export function detectSourceType(url: string): "social" | "video" | "code" | "news" | "web" {
  // Social media platforms
  if (isDomainMatch(url, "twitter.com") || isDomainMatch(url, "x.com")) {
    return "social";
  }
  if (isDomainMatch(url, "facebook.com") || isDomainMatch(url, "fb.com")) {
    return "social";
  }
  if (isDomainMatch(url, "instagram.com")) {
    return "social";
  }
  if (isDomainMatch(url, "linkedin.com")) {
    return "social";
  }
  if (isDomainMatch(url, "tiktok.com")) {
    return "social";
  }
  if (isDomainMatch(url, "reddit.com")) {
    return "social";
  }
  if (isDomainMatch(url, "mastodon.social") || isDomainMatch(url, "threads.net")) {
    return "social";
  }

  // Video platforms
  if (isDomainMatch(url, "youtube.com") || isDomainMatch(url, "youtu.be")) {
    return "video";
  }
  if (isDomainMatch(url, "twitch.tv")) {
    return "video";
  }
  if (isDomainMatch(url, "vimeo.com")) {
    return "video";
  }
  if (isDomainMatch(url, "dailymotion.com")) {
    return "video";
  }

  // Code/Developer platforms
  if (isDomainMatch(url, "github.com")) {
    return "code";
  }
  if (isDomainMatch(url, "gitlab.com")) {
    return "code";
  }
  if (isDomainMatch(url, "bitbucket.org")) {
    return "code";
  }
  if (isDomainMatch(url, "stackoverflow.com")) {
    return "code";
  }

  // News platforms
  if (isDomainMatch(url, "bbc.com") || isDomainMatch(url, "bbc.co.uk")) {
    return "news";
  }
  if (isDomainMatch(url, "cnn.com")) {
    return "news";
  }
  if (isDomainMatch(url, "reuters.com")) {
    return "news";
  }
  if (isDomainMatch(url, "apnews.com")) {
    return "news";
  }
  if (isDomainMatch(url, "theguardian.com")) {
    return "news";
  }
  if (isDomainMatch(url, "nytimes.com")) {
    return "news";
  }
  if (isDomainMatch(url, "wsj.com")) {
    return "news";
  }

  // Default to generic web source
  return "web";
}

/**
 * Validate that a URL is from an approved domain.
 * Use this for whitelist-based URL validation.
 *
 * @param url - The URL to validate
 * @param approvedDomains - Set of domains that are allowed
 * @returns True if URL is from an approved domain
 *
 * @example
 * ```typescript
 * const approved = new Set(['example.com', 'trusted-api.com']);
 * if (isApprovedDomain('https://api.example.com/data', approved)) {
 *   // Process the URL
 * }
 * ```
 */
export function isApprovedDomain(url: string, approvedDomains: Set<string>): boolean {
  const domain = extractDomain(url);
  if (!domain) {
    return false;
  }

  // Check exact match
  if (approvedDomains.has(domain)) {
    return true;
  }

  // Check if it's a subdomain of an approved domain
  const parts = domain.split(".");
  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join(".");
    return approvedDomains.has(rootDomain);
  }

  return false;
}

/**
 * Block URLs from dangerous domains.
 * Use this for blacklist-based URL validation.
 *
 * @param url - The URL to check
 * @param blockedDomains - Set of domains that are not allowed
 * @returns True if URL is safe (not from a blocked domain)
 *
 * @example
 * ```typescript
 * const blocked = new Set(['malicious.com', 'phishing.net']);
 * if (!isBannedDomain('https://example.com', blocked)) {
 *   // URL is safe to process
 * }
 * ```
 */
export function isSafeDomain(url: string, blockedDomains: Set<string>): boolean {
  const domain = extractDomain(url);
  if (!domain) {
    // Invalid URL is always blocked
    return false;
  }

  // Check if exact domain is blocked
  if (blockedDomains.has(domain)) {
    return false;
  }

  // Check if parent domain is blocked
  const parts = domain.split(".");
  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join(".");
    if (blockedDomains.has(rootDomain)) {
      return false;
    }
  }

  return true;
}
