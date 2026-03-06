/**
 * @internal
 * Proof URL utilities used by internal rendering targets (HTML, GitHub, Slack renderers).
 * These are NOT part of the public API and are no longer exported from the package root.
 * If you were using `buildProofUrl` or `buildSnippetImageUrl` via `import from "deepcitation"`,
 * import directly from `"deepcitation/rendering/proofUrl"` or build proof URLs manually.
 */

/**
 * Options for building proof page URLs.
 */
export interface ProofUrlOptions {
  /** Base URL for the proof service (e.g., "https://proof.deepcitation.com") */
  baseUrl: string;

  /** View mode for the proof page */
  view?: "snippet" | "context" | "page";

  /** Output format */
  format?: "html" | "png";

  /** Theme */
  theme?: "light" | "dark";

  /** Extra context padding (pixels) */
  pad?: number;

  /** Signed URL token (for access control) */
  token?: string;

  /** Expiry timestamp for signed URLs */
  expires?: number;
}

/**
 * Build a proof page URL from a proof ID.
 * The proof ID comes from the verification response (assigned by backend).
 */
export function buildProofUrl(proofId: string, options: ProofUrlOptions): string {
  let base = options.baseUrl;
  while (base.endsWith("/")) base = base.slice(0, -1);
  const url = new URL(`${base}/p/${encodeURIComponent(proofId)}`);

  if (options.view) url.searchParams.set("view", options.view);
  if (options.format) url.searchParams.set("format", options.format);
  if (options.theme) url.searchParams.set("theme", options.theme);
  if (options.pad != null) url.searchParams.set("pad", String(options.pad));
  if (options.token) url.searchParams.set("token", options.token);
  if (options.expires != null) url.searchParams.set("expires", String(options.expires));

  return url.toString();
}

/**
 * Build a direct image URL for a proof snippet.
 * Used in GitHub Markdown (![](url)) and HTML (<img src="">) targets.
 */
export function buildSnippetImageUrl(proofId: string, options: ProofUrlOptions): string {
  return buildProofUrl(proofId, { ...options, format: "png", view: "snippet" });
}
