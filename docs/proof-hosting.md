---
layout: default
title: Proof Hosting
nav_order: 5
description: "Shareable, URL-addressable proof pages for citation verification"
---

# Proof Hosting

Generate shareable proof page URLs for every verified citation. Proof pages provide a hosted HTML view of the verification result — including the source snippet, claim text, and verification status — with interactive view switching from snippet to full page.

---

## Why Proof Hosting?

By default, DeepCitation returns verification proof as base64-encoded images embedded in the response. This works for React apps rendering inline popovers, but fails for other surfaces:

| Surface | Problem with base64 | Solution with proof hosting |
|:--------|:---------------------|:----------------------------|
| Slack | Cannot embed images in mrkdwn | Proof URL unfurls with OG preview |
| GitHub | Cannot embed base64 in Markdown | `![proof](proofImageUrl)` works |
| Email | Base64 bloats payload, often blocked | Link to hosted proof page |
| Terminal | No image capability | URL users can open in a browser |
| Audit logs | Base64 strings aren't shareable | Persistent, bookmarkable URLs |

---

## Quick Start

Add `generateProofUrls: true` to your verification request:

{% raw %}
```typescript
import { DeepCitation } from "@deepcitation/deepcitation-js";

const dc = new DeepCitation({ apiKey: process.env.DEEPCITATION_API_KEY });

const { attachmentId } = await dc.uploadFile(pdfBuffer, { filename: "report.pdf" });

// ... call your LLM, extract citations ...

const verified = await dc.verify(attachmentId, citations, {
  generateProofUrls: true,
  proofConfig: {
    access: "signed",       // "signed" | "workspace" | "public"
    signedUrlExpiry: "7d",  // token lifetime
    imageFormat: "png",     // "png" | "jpeg" | "avif" | "webp"
  },
});

// Each verification now includes proof URLs
for (const [key, result] of Object.entries(verified.verifications)) {
  console.log(result.proofUrl);      // → https://proof.deepcitation.com/p/xK9mPq...
  console.log(result.proofImageUrl); // → https://proof.deepcitation.com/p/xK9mPq...?format=png
}
```
{% endraw %}

---

## Proof Page Views

Every proof page supports three views. Users can switch between them interactively using the tab bar on the proof page.

| View | URL param | Description | Use case |
|:-----|:----------|:------------|:---------|
| **Snippet** | `?view=snippet` | Tight crop around the matched text (40px padding) | Default view, OG previews, quick check |
| **Context** | `?view=context` | Wider view with surrounding content (200px padding) | Reading context around the citation |
| **Full Page** | `?view=page` | Complete page with highlight overlay | Full document context, detailed review |

### Linking to a specific view

```typescript
// Link directly to the full page view
const fullPageUrl = `${verification.proofUrl}&view=page`;

// Or use the URL builder
import { buildProofUrl } from "@deepcitation/deepcitation-js";

const url = buildProofUrl(verification.proofId, {
  baseUrl: "https://proof.deepcitation.com",
  view: "page",
});
```

---

## Access Control

Three access levels control who can view proof pages:

### Signed (default)

URLs include a JWT token with configurable expiry. The token is scoped to a single proof.

```typescript
proofConfig: {
  access: "signed",
  signedUrlExpiry: "7d",  // "1h" | "24h" | "7d" | "30d" | "90d" | "1y"
}
```

{: .important }
Signed URLs contain tokens in the query string. Treat them as secrets — they grant read access to the proof content.

### Workspace

Anyone in your workspace can access without a token. Requires workspace authentication.

```typescript
proofConfig: { access: "workspace" }
```

### Public

No authentication required. Anyone with the URL can view.

```typescript
proofConfig: { access: "public" }
```

{: .note }
Public proofs include full OG metadata (title, description, snippet image) for rich link unfurls in Slack, Twitter, and other platforms. Non-public proofs use generic OG tags to prevent content leakage.

---

## React Integration

When proof hosting is enabled, the `CitationComponent` automatically shows a **"View page"** button in the verification image action bar.

{% raw %}
```tsx
import { CitationComponent } from "@deepcitation/deepcitation-js/react";

// verification.proofUrl is set when generateProofUrls was true
<CitationComponent
  citation={citation}
  verification={verification}
/>
// The popover image bar now shows: [Expand] [View page]
// Clicking "View page" opens the proof page at ?view=page in a new tab
```
{% endraw %}

### Custom "View page" behavior

Override the default behavior with the `onViewPageClick` prop:

{% raw %}
```tsx
<CitationComponent
  citation={citation}
  verification={verification}
  onViewPageClick={(page) => {
    // Custom action — e.g., open in a sidebar instead of new tab
    setSidebarUrl(page.source);
  }}
/>
```
{% endraw %}

### Using with pre-rendered page images

If you have pre-rendered page images from the Page API (stored in the `Page` object), pass them directly:

{% raw %}
```tsx
<CitationComponent
  citation={citation}
  verification={verification}
  page={attachmentPages[verification.verifiedPageNumber - 1]}
  onViewPageClick={(page) => {
    // Open your own page viewer with the page image
    openPageViewer(page.source);
  }}
/>
```
{% endraw %}

---

## Using in Slack, GitHub, and Other Surfaces

### Slack mrkdwn

Use `proofUrl` as a link — Slack will unfurl it with OG metadata:

```typescript
const message = citations.map(([key, v]) =>
  `<${v.proofUrl}|[${v.status === "found" ? "✓" : "✗"}] ${v.verifiedMatchSnippet?.slice(0, 50)}>`
).join("\n");
```

### GitHub Markdown

Embed the proof image directly:

```typescript
const markdown = citations.map(([key, v]) =>
  `[![Proof](${v.proofImageUrl})](${v.proofUrl})`
).join("\n\n");
```

### HTML email

```typescript
const html = citations.map(([key, v]) =>
  `<a href="${v.proofUrl}"><img src="${v.proofImageUrl}" alt="Citation proof" /></a>`
).join("");
```

---

## Image Formats

Proof images can be served in multiple formats:

| Format | Best for | Size |
|:-------|:---------|:-----|
| `png` | Universal compatibility, GitHub, Slack | Larger |
| `jpeg` | Email, bandwidth-constrained | Medium |
| `avif` | Modern browsers, smallest size | Smallest |
| `webp` | Modern browsers, good compression | Small |

Request a specific format:

```
GET /p/{proofId}?format=png&view=snippet
GET /p/{proofId}?format=avif&view=page
```

---

## URL Builder Utilities

Build proof URLs programmatically without calling the backend:

```typescript
import { buildProofUrl, buildSnippetImageUrl } from "@deepcitation/deepcitation-js";

// Full proof page URL
const pageUrl = buildProofUrl(proofId, {
  baseUrl: "https://proof.deepcitation.com",
  view: "page",
  token: signedToken,
});

// Direct snippet image URL (for embedding)
const imageUrl = buildSnippetImageUrl(proofId, {
  baseUrl: "https://proof.deepcitation.com",
});
```

---

## Proof Page Endpoint Reference

```
GET /p/{proofId}
```

### Query Parameters

| Param | Type | Default | Description |
|:------|:-----|:--------|:------------|
| `view` | `snippet` \| `context` \| `page` | `snippet` | What to show |
| `format` | `html` \| `png` \| `jpeg` \| `avif` \| `webp` | `html` | Response format |
| `token` | string | — | Signed access token (required for `access: "signed"`) |

### Response

**`format=html`** — Interactive proof page with view switcher, OG meta tags, claim text, and status badge.

**`format=png|jpeg|avif|webp`** — Direct image binary. Use for embedding in Markdown, HTML, or chat.

### Caching

| Access level | HTML cache | Image cache |
|:-------------|:-----------|:------------|
| `public` | `public, max-age=3600` | `public, max-age=86400` |
| `signed` / `workspace` | `private, max-age=1800` | `private, max-age=3600` |

---

## Backwards Compatibility

Proof hosting is opt-in and fully backwards compatible:

- `verifyCitations` works exactly as before when `generateProofUrls` is not set
- `verificationImageBase64` continues to be returned by default
- When `generateProofUrls: true`, base64 images are omitted to reduce payload — re-enable with `proofConfig.includeBase64: true`
- The `Verification` interface gains three optional fields (`proofId`, `proofUrl`, `proofImageUrl`)

```typescript
// Before (React only — still works)
const verified = await dc.verify(attachmentId, citations);
// verified["key"].verificationImageBase64 → base64 string

// After (multi-surface)
const verified = await dc.verify(attachmentId, citations, {
  generateProofUrls: true,
});
// verified["key"].proofUrl → "https://proof.deepcitation.com/p/..."
// verified["key"].proofImageUrl → "https://proof.deepcitation.com/p/...?format=png"
```

---

## Next Steps

- [API Reference]({{ site.baseurl }}/api-reference/) — Full endpoint documentation including proof fields
- [Components]({{ site.baseurl }}/components/) — CitationComponent with proof page integration
- [Real-World Examples]({{ site.baseurl }}/real-world-examples/) — Integration patterns for Slack, GitHub, and more
