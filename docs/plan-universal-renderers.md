# Universal Proof Renderers — Architecture Plan

## Status: DRAFT
## Date: 2025-02-09

---

## 1. Executive Summary

DeepCitation currently renders citations in two targets: **React** (interactive components with popovers and base64 proof images) and **Markdown** (static text with indicators). Both are client-only; proof images are embedded as base64 strings in `Verification` objects.

This plan introduces a **universal renderer architecture** that:

1. Extracts shared rendering logic into a framework-agnostic core
2. Adds 3 new render targets: **Slack**, **GitHub Markdown**, **HTML/Email**
3. Enhances the existing Markdown renderer to serve as the foundation for all text-based targets
4. Defines the **backend API contract** needed to host proof pages and serve proof images at URLs (replacing inline base64 for non-React surfaces)

---

## 2. Top 5 Render Targets (Ranked by Impact)

| # | Target | Surface | Output Format | Interactivity | Image Support | Status |
|---|--------|---------|---------------|---------------|---------------|--------|
| 1 | **React/Web** | SPAs, dashboards, chat UIs | JSX/DOM | Full (hover, click, popover, portal) | Base64 inline | **Exists** |
| 2 | **Slack** | Bot messages, workflow outputs | mrkdwn (Slack's markup) | Link clicks only | Unfurl previews via OG | **New** |
| 3 | **GitHub Markdown** | PR comments, issues, code review bots | GFM + HTML subset | `<details>` expand | Hosted image URLs | **New** (extends existing MD) |
| 4 | **HTML (static)** | Email digests, static reports, Notion (via paste), embeds | Self-contained HTML | Hover tooltips (CSS only) | Inline or hosted URLs | **New** |
| 5 | **Terminal/CLI** | CLI tools, logs, developer tooling | ANSI escape codes + plain text | None | None (text only) | **New** |

### Why these 5?

- **React** — already exists, is the richest target, and stays as-is.
- **Slack** — highest demand. Every AI-in-Slack bot needs citation rendering. Slack's mrkdwn is unique enough to warrant its own target.
- **GitHub Markdown** — AI code review bots, PR summaries, issue triage. GitHub supports `<details>`, inline HTML, and hosted images — a richer subset than plain Markdown.
- **HTML (static)** — universal fallback. Email newsletters, Notion (paste HTML), static pages, iframe embeds. Also serves as the base for future targets (Discord rich embeds, Microsoft Teams adaptive cards).
- **Terminal/CLI** — developer tooling. CLI-based AI assistants, log output, CI/CD reports. ANSI colors for status, no images.

### Targets considered but deferred

| Target | Reason for deferral |
|--------|-------------------|
| **Notion** | Notion's API accepts Markdown and HTML; covered by those targets. A native block renderer can follow later. |
| **Discord** | Discord Markdown is nearly identical to GitHub Markdown; can be a thin wrapper. |
| **Microsoft Teams** | Adaptive Cards are JSON; can be built from the proof object directly. Low volume for now. |
| **Google Docs** | Requires Google Docs API integration; out of scope for a rendering library. |
| **PDF export** | Can be generated from the HTML target via headless browser. Not a renderer concern. |

---

## 3. Architecture

### 3.1 Current Architecture (Before)

```
src/
├── react/                  ← React renderer (2500+ LOC, tightly coupled)
│   ├── CitationComponent   ← Monolithic: variants + popover + behavior + status
│   ├── CitationVariants    ← React-specific variant rendering
│   └── utils.ts            ← generateCitationKey (shared but lives in react/)
├── markdown/               ← Markdown renderer (standalone, clean)
│   ├── renderMarkdown      ← cite tag → markdown string
│   └── markdownVariants    ← Text variant rendering
├── types/                  ← Shared types (Citation, Verification, etc.)
└── parsing/                ← getCitationStatus (shared but lives in parsing/)
```

**Problems:**
- `generateCitationKey` lives in `react/utils.ts` but is imported by markdown and main exports
- `getCitationStatus` lives in `parsing/parseCitation.ts` but is core rendering logic
- No shared "proof URL" concept — everything is base64
- Each target re-implements status→indicator logic independently
- No way to generate linked citations without React DOM

### 3.2 Proposed Architecture (After)

```
src/
├── rendering/                    ← NEW: Universal rendering core
│   ├── core/                     ← Shared logic (framework-agnostic)
│   │   ├── status.ts             ← getCitationStatus() — moved from parsing/
│   │   ├── indicators.ts         ← getIndicator(), INDICATOR_SETS — moved from markdown/
│   │   ├── displayText.ts        ← getCitationDisplayText() — extracted
│   │   ├── proofUrl.ts           ← buildProofUrl(), buildSnippetImageUrl()
│   │   ├── citationKey.ts        ← generateCitationKey() — moved from react/utils
│   │   └── types.ts              ← RenderedCitation, RenderTarget, RenderOptions
│   │
│   ├── targets/                  ← Render target implementations
│   │   ├── slack/                ← Slack mrkdwn renderer
│   │   │   ├── index.ts
│   │   │   ├── slackRenderer.ts  ← renderCitationsForSlack()
│   │   │   ├── slackVariants.ts  ← mrkdwn formatting per variant
│   │   │   └── types.ts          ← SlackRenderOptions, SlackOutput
│   │   │
│   │   ├── github/               ← GitHub-flavored Markdown renderer
│   │   │   ├── index.ts
│   │   │   ├── githubRenderer.ts ← renderCitationsForGitHub()
│   │   │   ├── githubVariants.ts ← GFM + <details> + image support
│   │   │   └── types.ts          ← GitHubRenderOptions, GitHubOutput
│   │   │
│   │   ├── html/                 ← Static HTML renderer
│   │   │   ├── index.ts
│   │   │   ├── htmlRenderer.ts   ← renderCitationsAsHtml()
│   │   │   ├── htmlVariants.ts   ← <span> based, CSS-only interactivity
│   │   │   ├── styles.ts         ← Inline CSS / <style> block generation
│   │   │   └── types.ts          ← HtmlRenderOptions, HtmlOutput
│   │   │
│   │   └── terminal/             ← Terminal/ANSI renderer
│   │       ├── index.ts
│   │       ├── terminalRenderer.ts ← renderCitationsForTerminal()
│   │       ├── ansiColors.ts     ← ANSI escape sequences for status colors
│   │       └── types.ts          ← TerminalRenderOptions, TerminalOutput
│   │
│   └── index.ts                  ← Re-exports, createRenderer() factory
│
├── react/                        ← React renderer (unchanged, imports from rendering/core)
├── markdown/                     ← Existing markdown renderer (refactored to use core)
├── types/                        ← Shared types (unchanged)
├── parsing/                      ← Citation parsing (getCitationStatus moved to core, re-exported)
└── client/                       ← API client (unchanged)
```

### 3.3 Key Design Principles

1. **Same proof object, multiple renderers.** All targets consume `Citation` + `Verification` and produce target-specific output. No data transformation needed.

2. **Progressive disclosure is universal.** Every target implements 3 tiers:
   - **Tier 0 (inline):** Compact marker at point of claim (`[1✓]`, `<proof_url|[1✓]>`, `<span>`)
   - **Tier 1 (preview):** Expanded context available without leaving the surface (references section, `<details>`, tooltip)
   - **Tier 2 (proof page):** Click-through to hosted proof page with highlighted snippet image

3. **Proof URLs are the universal bridge.** Non-React targets can't embed base64 images inline. The backend provides hosted proof URLs that serve as the click-through target and image source for all surfaces.

4. **Text targets share indicator logic.** Slack, GitHub, Terminal, and Markdown all use the same `getIndicator()` → `IndicatorSet` system. Only the wrapping/linking differs.

5. **No framework dependencies in core.** `rendering/core/` has zero dependencies on React, DOM, or any UI framework. Pure TypeScript functions that return strings or data objects.

---

## 4. Render Target Specifications

### 4.1 Slack mrkdwn Renderer

#### Output format

```
Revenue grew 23% in Q4. <https://proof.deepcitation.com/p/abc123|[1✓]>

The company hired 500 engineers. <https://proof.deepcitation.com/p/def456|[2⚠]>
```

#### Sources appendix (optional, appended when `includeSources: true`)

```
*Sources:*
• <https://proof.deepcitation.com/p/abc123|[1✓]> Q4 Financial Report — p.12
• <https://proof.deepcitation.com/p/def456|[2⚠]> HR Annual Review — p.3
```

#### Variants

| Variant | Output | Notes |
|---------|--------|-------|
| `"brackets"` (default) | `<url\|[1✓]>` | Clean, compact, standard |
| `"inline"` | `<url\|Revenue grew 23%✓>` | Descriptive but longer |
| `"number"` | `<url\|¹✓>` | Superscript-style, minimal |

#### Slack-specific constraints

- No bold/italic inside links (Slack limitation)
- `<url|text>` is the only link format
- No images inline — rely on Slack unfurl of proof URL
- 4000 char message limit — must truncate sources if needed
- Block Kit support deferred to Phase 2

#### API

```typescript
import { renderCitationsForSlack } from "@deepcitation/deepcitation-js/slack";

const output = renderCitationsForSlack(llmOutput, {
  verifications,
  variant: "brackets",           // default
  indicatorStyle: "check",       // ✓ ⚠ ✗ ◌
  proofBaseUrl: "https://proof.deepcitation.com",
  includeSources: true,          // append Sources list
  maxMessageLength: 4000,        // truncate if needed
  sourceLabels: { "att-123": "Q4 Report" },
});

// output.message: string (Slack mrkdwn)
// output.sources: string | undefined (Sources section)
// output.full: string (message + sources)
// output.citations: CitationWithStatus[]
// output.proofUrls: Record<string, string> (citationKey → proof URL)
```

#### Unfurl support

When a proof URL is posted in Slack, it should unfurl with:
- **Title:** `✓ Verified — Q4 Financial Report, p.12`
- **Description:** `"Revenue grew 23% in Q4."` (the claim text)
- **Image:** Snippet image (highlighted crop) — served by backend at proof URL with OG tags

This is handled entirely by the **backend proof page** (OG meta tags). The Slack renderer just outputs the URL.

---

### 4.2 GitHub Markdown Renderer

#### Output format (default: brackets with `<details>`)

```markdown
Revenue grew 23% in Q4. [[1✓]](https://proof.deepcitation.com/p/abc123)

The company hired 500 engineers. [[2⚠]](https://proof.deepcitation.com/p/def456)

<details>
<summary><b>Sources (2)</b></summary>
<br>

| # | Status | Source | Location | Proof |
|---|--------|--------|----------|-------|
| 1 | ✓ Verified | Q4 Financial Report | p.12 | [View proof](https://proof.deepcitation.com/p/abc123) |
| 2 | ⚠ Partial | HR Annual Review | p.3 | [View proof](https://proof.deepcitation.com/p/def456) |

</details>
```

#### With proof images (when `includeImages: true`)

```markdown
<details>
<summary><b>Sources (2)</b></summary>
<br>

**[1✓] Q4 Financial Report — p.12**
> "Revenue grew 23% in Q4."

![Proof snippet](https://proof.deepcitation.com/p/abc123?format=png&view=snippet)

---

**[2⚠] HR Annual Review — p.3**
> "The company hired approximately 500 new engineers."

![Proof snippet](https://proof.deepcitation.com/p/def456?format=png&view=snippet)

</details>
```

#### Variants

| Variant | Inline Output | Notes |
|---------|---------------|-------|
| `"brackets"` (default) | `[[1✓]](url)` | Standard linked bracket |
| `"superscript"` | `[¹✓](url)` | Footnote style |
| `"inline"` | `[Revenue grew 23%✓](url)` | Descriptive anchor text |
| `"footnote"` | `text[^1]` + footnote section | GitHub-supported footnotes |

#### GitHub-specific features

- `<details><summary>` for collapsible sources — keeps PR comments clean
- Table format for structured source lists
- Image embedding via `![alt](url)` using hosted proof image URLs
- Footnote syntax (`[^1]`) supported in GitHub Markdown
- HTML subset allowed: `<details>`, `<summary>`, `<b>`, `<br>`, `<a>`, `<img>`

#### API

```typescript
import { renderCitationsForGitHub } from "@deepcitation/deepcitation-js/github";

const output = renderCitationsForGitHub(llmOutput, {
  verifications,
  variant: "brackets",
  indicatorStyle: "check",
  proofBaseUrl: "https://proof.deepcitation.com",
  includeSources: true,           // <details> section
  sourcesFormat: "table",         // "table" | "list" | "detailed"
  includeImages: false,           // embed proof images in sources
  sourceLabels: { "att-123": "Q4 Report" },
});

// output.markdown: string (inline citations)
// output.sources: string (the <details> block)
// output.full: string (markdown + sources)
// output.citations: CitationWithStatus[]
// output.proofUrls: Record<string, string>
```

---

### 4.3 HTML (Static) Renderer

#### Output format

```html
<p>
  Revenue grew 23% in Q4.
  <span class="dc-citation dc-verified" data-citation-key="abc123" data-proof-url="https://proof.deepcitation.com/p/abc123">
    <a href="https://proof.deepcitation.com/p/abc123" target="_blank" rel="noopener" class="dc-citation-link">
      <span class="dc-citation-text">[1</span><span class="dc-indicator dc-indicator-verified">✓</span><span class="dc-citation-text">]</span>
    </a>
    <span class="dc-tooltip">
      <span class="dc-tooltip-status">✓ Verified</span>
      <span class="dc-tooltip-source">Q4 Financial Report — p.12</span>
      <span class="dc-tooltip-quote">"Revenue grew 23% in Q4."</span>
      <img class="dc-tooltip-image" src="https://proof.deepcitation.com/p/abc123?format=png&view=snippet" alt="Proof snippet" loading="lazy" />
    </span>
  </span>
</p>
```

#### Variants

| Variant | Output | Notes |
|---------|--------|-------|
| `"linter"` | Underlined text spans | CSS text-decoration mirrors React linter variant |
| `"brackets"` (default) | `[1✓]` with tooltip | Clean, compact |
| `"chip"` | Pill badge | Background color, rounded corners |
| `"superscript"` | `¹✓` small raised | Footnote style |

#### Use cases

- **Email digests:** Self-contained HTML with inline `<style>` and hosted image URLs
- **Notion:** Paste rich HTML into Notion — it preserves links, spans, and tooltips
- **Static reports:** Embed in any HTML page without JavaScript
- **iframe embeds:** Self-contained citation display

#### Features

- CSS-only tooltips on hover (no JavaScript required)
- `data-*` attributes for external JavaScript to hook into
- Inline `<style>` block or external CSS class names (configurable)
- Dark mode support via `prefers-color-scheme` media query
- Self-contained mode for email (all styles inline)

#### API

```typescript
import { renderCitationsAsHtml } from "@deepcitation/deepcitation-js/html";

const output = renderCitationsAsHtml(llmOutput, {
  verifications,
  variant: "brackets",
  proofBaseUrl: "https://proof.deepcitation.com",
  includeSources: true,
  includeStyles: true,           // embed <style> block
  inlineStyles: false,           // use inline style="" (for email)
  includeTooltips: true,         // CSS hover tooltips
  theme: "light",                // "light" | "dark" | "auto"
  classPrefix: "dc-",            // CSS class prefix
});

// output.html: string (the rendered HTML fragment)
// output.styles: string (the <style> block, if includeStyles)
// output.full: string (styles + html)
// output.citations: CitationWithStatus[]
```

---

### 4.4 Terminal/CLI Renderer

#### Output format (with ANSI colors)

```
Revenue grew 23% in Q4. [1✓]  ← green
The company hired 500 engineers. [2⚠]  ← yellow/amber
The product launched last month. [3✗]  ← red
```

#### Sources section

```
─── Sources ───────────────────────────────────
 [1] ✓ Q4 Financial Report — p.12
     "Revenue grew 23% in Q4."
 [2] ⚠ HR Annual Review — p.3
     "The company hired approximately 500 new engineers."
 [3] ✗ Press Release — p.1
     Not found in source document
────────────────────────────────────────────────
```

#### Variants

| Variant | Output | Notes |
|---------|--------|-------|
| `"brackets"` (default) | `[1✓]` | With ANSI color for status |
| `"inline"` | `Revenue grew 23%✓` | Colored indicator inline |
| `"minimal"` | `✓` | Just the indicator |

#### Features

- ANSI 256-color or 16-color fallback
- `NO_COLOR` environment variable support (plain text fallback)
- Box-drawing characters for sources section border
- Configurable indicator symbols
- Width-aware truncation for narrow terminals

#### API

```typescript
import { renderCitationsForTerminal } from "@deepcitation/deepcitation-js/terminal";

const output = renderCitationsForTerminal(llmOutput, {
  verifications,
  variant: "brackets",
  indicatorStyle: "check",
  color: true,                   // enable ANSI colors (auto-detects NO_COLOR)
  includeSources: true,
  maxWidth: process.stdout.columns || 80,
});

// output.text: string (ANSI-colored text)
// output.plain: string (no ANSI codes, for logging)
// output.sources: string
// output.full: string (text + sources)
// output.citations: CitationWithStatus[]
```

---

### 4.5 React/Web (Existing — No Changes Required)

The React renderer continues to use base64 images from `Verification.verificationImageBase64` for popovers. No changes to the React target are required for this plan.

**Future enhancement (Phase 2):** React components could optionally accept `proofUrl` instead of base64, allowing lazy-loading of proof images from hosted URLs. This would reduce initial payload size for large citation sets.

---

## 5. Shared Core (`rendering/core/`)

### 5.1 Proof URL Builder

The critical new piece: a function to construct proof page URLs from citation/verification data.

```typescript
// rendering/core/proofUrl.ts

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
 * Build a proof page URL from a citation key and verification data.
 *
 * The proof ID is derived from the verification response, NOT the citation key.
 * The backend assigns proof IDs during verification.
 */
export function buildProofUrl(proofId: string, options: ProofUrlOptions): string;

/**
 * Build a direct image URL for a proof snippet.
 * Used in GitHub Markdown (![](url)) and HTML (<img src="">) targets.
 */
export function buildSnippetImageUrl(proofId: string, options: ProofUrlOptions): string;

/**
 * Build proof URLs for all citations in a verification record.
 * Returns a map of citationKey → proofUrl.
 */
export function buildProofUrls(
  verifications: VerificationRecord,
  options: ProofUrlOptions
): Record<string, string>;
```

### 5.2 Shared Status & Indicators

Consolidate status logic currently split across `parsing/` and `markdown/`:

```typescript
// rendering/core/status.ts — re-export from parsing (no duplication)
export { getCitationStatus } from "../../parsing/parseCitation.js";

// rendering/core/indicators.ts — moved from markdown/types.ts
export { getIndicator, INDICATOR_SETS, SUPERSCRIPT_DIGITS } from "./indicators.js";
export type { IndicatorStyle, IndicatorSet } from "./indicators.js";
```

### 5.3 Shared Display Text

```typescript
// rendering/core/displayText.ts
export function getCitationDisplayText(citation: Citation, variant: string): string;
export function getSourceLabel(citation: Citation, verification: Verification | null, sourceLabels?: Record<string, string>): string;
export function formatPageLocation(citation: Citation, verification: Verification | null): string;
```

### 5.4 Renderer Interface

All text-based targets implement a common pattern:

```typescript
// rendering/core/types.ts

export interface RenderOptions {
  /** Verification results keyed by citationKey */
  verifications?: VerificationRecord;
  /** Indicator style */
  indicatorStyle?: IndicatorStyle;
  /** Base URL for proof pages */
  proofBaseUrl?: string;
  /** Include sources/references section */
  includeSources?: boolean;
  /** Custom source labels by attachmentId */
  sourceLabels?: Record<string, string>;
  /** Signed URL token provider */
  signedUrlProvider?: (proofId: string) => string;
}

export interface RenderedOutput {
  /** The rendered inline content */
  content: string;
  /** The sources/references section (if requested) */
  sources?: string;
  /** Combined content + sources */
  full: string;
  /** Citation metadata */
  citations: CitationWithStatus[];
  /** Proof URLs by citationKey (if proofBaseUrl provided) */
  proofUrls?: Record<string, string>;
}
```

Each target extends these with target-specific options (e.g., `maxMessageLength` for Slack, `includeImages` for GitHub).

---

## 6. Entry Points & Exports

### Package exports (package.json)

```jsonc
{
  "exports": {
    ".": "./dist/index.js",           // existing
    "./react": "./dist/react/index.js", // existing
    "./markdown": "./dist/markdown/index.js", // existing
    "./slack": "./dist/rendering/targets/slack/index.js",     // NEW
    "./github": "./dist/rendering/targets/github/index.js",   // NEW
    "./html": "./dist/rendering/targets/html/index.js",       // NEW
    "./terminal": "./dist/rendering/targets/terminal/index.js" // NEW
  }
}
```

### Import examples

```typescript
// Existing (unchanged)
import { getAllCitationsFromLlmOutput } from "@deepcitation/deepcitation-js";
import { CitationComponent } from "@deepcitation/deepcitation-js/react";
import { toMarkdown } from "@deepcitation/deepcitation-js/markdown";

// New targets
import { renderCitationsForSlack } from "@deepcitation/deepcitation-js/slack";
import { renderCitationsForGitHub } from "@deepcitation/deepcitation-js/github";
import { renderCitationsAsHtml } from "@deepcitation/deepcitation-js/html";
import { renderCitationsForTerminal } from "@deepcitation/deepcitation-js/terminal";
```

---

## 7. Migration & Backwards Compatibility

### No breaking changes

- `markdown/` module stays at its current path and API
- `react/` module stays at its current path and API
- Main exports (`index.ts`) unchanged
- `getCitationStatus` remains exported from main entry point
- `generateCitationKey` remains exported from main entry point

### Internal refactoring (non-breaking)

- `generateCitationKey` moves from `react/utils.ts` to `rendering/core/citationKey.ts`, with re-export from `react/utils.ts` for backwards compat
- `getCitationStatus` stays in `parsing/parseCitation.ts`, re-exported by `rendering/core/status.ts`
- `getIndicator` and `INDICATOR_SETS` move from `markdown/types.ts` to `rendering/core/indicators.ts`, with re-export from `markdown/` for backwards compat

---

## 8. Implementation Phases

### Phase 1: Core + Slack + GitHub (Week 1)

1. Create `rendering/core/` with proofUrl, indicators, displayText, types
2. Build Slack renderer with brackets variant and sources appendix
3. Build GitHub renderer with brackets variant, `<details>` sources, and image support
4. Add package.json exports for `/slack` and `/github`
5. Tests for all renderers
6. Documentation

### Phase 2: HTML + Terminal (Week 2)

1. Build HTML renderer with CSS tooltips and self-contained mode
2. Build Terminal renderer with ANSI colors and box-drawing
3. Add package.json exports for `/html` and `/terminal`
4. Tests and documentation

### Phase 3: Proof URL Integration (depends on backend)

1. Integrate `proofUrl` into verification response (backend returns `proofId`)
2. Update Slack and GitHub renderers to use real proof URLs
3. Add signed URL support
4. End-to-end testing with live proof pages

### Phase 4: React Enhancement (Optional)

1. Add `proofUrl` prop to `CitationComponent` as alternative to base64
2. Lazy-load proof images from hosted URLs
3. Add "Open proof page" link in popover

---

## 9. Testing Strategy

### Unit tests for each target

```
src/__tests__/
├── rendering/
│   ├── core/
│   │   ├── proofUrl.test.ts
│   │   ├── indicators.test.ts
│   │   └── displayText.test.ts
│   ├── slack/
│   │   ├── slackRenderer.test.ts
│   │   └── slackVariants.test.ts
│   ├── github/
│   │   ├── githubRenderer.test.ts
│   │   └── githubVariants.test.ts
│   ├── html/
│   │   ├── htmlRenderer.test.ts
│   │   └── htmlStyles.test.ts
│   └── terminal/
│       ├── terminalRenderer.test.ts
│       └── ansiColors.test.ts
```

### Snapshot tests

Each renderer should have snapshot tests with:
- Single citation (each variant)
- Multiple citations with mixed statuses
- Sources section
- Edge cases (no verifications, no anchor text, URL citations)

### Visual testing (showcase)

Extend the existing markdown showcase to include all targets:
- Side-by-side rendering of the same citations across targets
- Slack preview (rendered in a Slack-like container)
- GitHub preview (rendered in a GitHub-like container)
- Terminal preview (ANSI → HTML conversion for browser viewing)

---

## 10. Proof URL Behavior Summary

| Surface | Inline marker | Links to | Image source |
|---------|--------------|----------|-------------|
| React | `<span>` with popover | N/A (popover) | `Verification.verificationImageBase64` |
| Slack | `<url\|[1✓]>` | Proof page | OG image from proof page unfurl |
| GitHub | `[[1✓]](url)` | Proof page | `![](url?format=png)` in `<details>` |
| HTML | `<a href="url">[1✓]</a>` | Proof page | `<img>` in tooltip or sources |
| Terminal | `[1✓]` (no link) | N/A | N/A (text only) |
| Markdown | `[1✓](#ref-1)` | In-page anchor | N/A (text only) |

---

## Appendix A: Full File Inventory (New Files)

```
src/rendering/
├── core/
│   ├── index.ts              (~20 LOC, re-exports)
│   ├── types.ts              (~80 LOC, interfaces)
│   ├── proofUrl.ts           (~60 LOC, URL builders)
│   ├── indicators.ts         (~50 LOC, moved from markdown)
│   ├── displayText.ts        (~40 LOC, extracted from markdown)
│   └── status.ts             (~10 LOC, re-export from parsing)
├── targets/
│   ├── slack/
│   │   ├── index.ts          (~15 LOC)
│   │   ├── slackRenderer.ts  (~150 LOC)
│   │   ├── slackVariants.ts  (~80 LOC)
│   │   └── types.ts          (~50 LOC)
│   ├── github/
│   │   ├── index.ts          (~15 LOC)
│   │   ├── githubRenderer.ts (~200 LOC)
│   │   ├── githubVariants.ts (~100 LOC)
│   │   └── types.ts          (~60 LOC)
│   ├── html/
│   │   ├── index.ts          (~15 LOC)
│   │   ├── htmlRenderer.ts   (~250 LOC)
│   │   ├── htmlVariants.ts   (~120 LOC)
│   │   ├── styles.ts         (~150 LOC)
│   │   └── types.ts          (~60 LOC)
│   └── terminal/
│       ├── index.ts          (~15 LOC)
│       ├── terminalRenderer.ts (~150 LOC)
│       ├── ansiColors.ts     (~60 LOC)
│       └── types.ts          (~40 LOC)
└── index.ts                  (~30 LOC, factory + re-exports)

Total new code: ~1,850 LOC (estimated)
```
