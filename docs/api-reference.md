---
layout: default
title: API Reference
nav_order: 3
description: "REST API endpoints for file preparation and citation verification"
has_children: true
---

# API Reference

REST API endpoints for preparing files and verifying citations.

---

## POST /prepareFile

Upload and process a document for citation verification. Extracts text with line IDs for LLM prompts.

### Content-Type

`multipart/form-data`

### Request Parameters

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `file` | File | Yes | PDF or image file (max 10MB) |
| `filename` | string | No | Override filename |

### Response Fields

| Field | Type | Description |
|:------|:-----|:------------|
| `attachmentId` | string | System-generated ID for verification calls. Store this to avoid re-uploading. |
| `deepTextPromptPortion` | string | Formatted text with page markers and line IDs for `wrapCitationPrompt()` |
| `status` | `"ready"` \| `"error"` | Processing status |
| `metadata` | object | File metadata (filename, mimeType, pageCount, textByteSize) |
| `processingTimeMs` | number | Processing time in milliseconds |
| `error` | string | Error message if status is "error" |

### Example Request

```bash
curl -X POST "https://api.deepcitation.com/prepareFile" \
  -H "Authorization: Bearer dc_live_your_api_key" \
  -F "file=@document.pdf"
```

### Example Response

```json
{
  "attachmentId": "abc123-def456-ghi789",
  "deepTextPromptPortion": "[Page 1]\n[L1] Revenue increased by 25% in Q4...\n[L2] Net profit margin improved...",
  "metadata": {
    "filename": "document.pdf",
    "mimeType": "application/pdf",
    "pageCount": 2,
    "textByteSize": 4096
  },
  "status": "ready",
  "processingTimeMs": 1234
}
```

---

## POST /verifyCitations

Verify citations from LLM output against the source document. Returns verification status and visual proof.

### Content-Type

`application/json`

### Request Parameters

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `data.attachmentId` | string | Yes | From prepareFile response. The SDK handles this automatically with `deepcitation.verify()`. |
| `data.citations` | `Record<string, Citation>` | Yes | Map of citation keys to Citation objects |
| `data.outputImageFormat` | `"jpeg"` \| `"png"` \| `"avif"` | No | Image format for proofs (default: "avif") |
| `data.generateProofUrls` | boolean | No | Enable [proof hosting]({{ site.baseurl }}/proof-hosting/) — returns `proofId`, `proofUrl`, and `proofImageUrl` per citation (default: false) |
| `data.proofConfig` | object | No | Proof URL configuration (only used when `generateProofUrls` is true) |
| `data.proofConfig.access` | `"signed"` \| `"workspace"` \| `"public"` | No | Access control level (default: "signed") |
| `data.proofConfig.signedUrlExpiry` | `"1h"` \| `"24h"` \| `"7d"` \| `"30d"` \| `"90d"` \| `"1y"` | No | Token expiry for signed URLs (default: "7d") |
| `data.proofConfig.imageFormat` | `"png"` \| `"jpeg"` \| `"avif"` \| `"webp"` | No | Image format for hosted proof images (default: "png") |
| `data.proofConfig.includeBase64` | boolean | No | Also return base64 images in addition to URLs (default: false) |

### Response Fields

| Field | Type | Description |
|:------|:-----|:------------|
| `verifications` | `Record<string, Verification>` | Map of citation keys to verification results |

### Example Request

```bash
curl -X POST "https://api.deepcitation.com/verifyCitations" \
  -H "Authorization: Bearer dc_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "attachmentId": "abc123-def456-ghi789",
      "citations": {
        "citation-1": {
          "fullPhrase": "Revenue increased by 25% in Q4",
          "pageNumber": 1
        },
        "citation-2": {
          "fullPhrase": "Net profit margin improved",
          "value": "profit margin"
        }
      },
      "outputImageFormat": "avif"
    }
  }'
```

### Example Response

```json
{
  "verifications": {
    "citation-1": {
      "pageNumber": 1,
      "lowerCaseSearchTerm": "revenue increased by 25% in q4",
      "matchSnippet": "...the company reported that Revenue increased by 25% in Q4 compared to...",
      "verificationImageBase64": "data:image/avif;base64,AAAAIGZ0eXBhdmlm...",
      "searchState": {
        "status": "found"
      },
      "verifiedAt": "2024-01-15T10:30:00.000Z"
    },
    "citation-2": {
      "pageNumber": 1,
      "lowerCaseSearchTerm": "net profit margin improved",
      "matchSnippet": "...operating costs. Net profit margin improved by 3.2 percentage points...",
      "verificationImageBase64": "data:image/avif;base64,AAAAIGZ0eXBhdmlm...",
      "searchState": {
        "status": "found"
      },
      "verifiedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Proof Hosting Response Fields

When `generateProofUrls: true`, each `Verification` object includes additional fields:

| Field | Type | Description |
|:------|:-----|:------------|
| `proofId` | string | Stable proof identifier (22-char URL-safe base64) |
| `proofUrl` | string | HTML proof page URL (includes signed token if applicable) |
| `proofImageUrl` | string | Direct image URL for embedding in Markdown, HTML, etc. |

{: .note }
When proof hosting is enabled, `verificationImageBase64` is omitted by default to reduce payload. Set `proofConfig.includeBase64: true` to include both.

#### Example Response (with proof hosting)

```json
{
  "verifications": {
    "citation-1": {
      "pageNumber": 1,
      "matchSnippet": "...Revenue increased by 25% in Q4...",
      "searchState": { "status": "found" },
      "proofId": "xK9mPqR2sT4uV6wY8zA1bC",
      "proofUrl": "https://proof.deepcitation.com/p/xK9mPqR2sT4uV6wY8zA1bC?token=eyJ...",
      "proofImageUrl": "https://proof.deepcitation.com/p/xK9mPqR2sT4uV6wY8zA1bC?format=png&view=snippet&token=eyJ..."
    }
  }
}
```

---

## GET /p/{proofId}

Serves a proof page (HTML or image) for a single citation verification. See the [Proof Hosting guide]({{ site.baseurl }}/proof-hosting/) for full details.

### Query Parameters

| Param | Type | Default | Description |
|:------|:-----|:--------|:------------|
| `view` | `snippet` \| `context` \| `page` | `snippet` | Image crop level |
| `format` | `html` \| `png` \| `jpeg` \| `avif` \| `webp` | `html` | Response format |
| `token` | string | — | Signed access token (required for `access: "signed"`) |

### Response

- **`format=html`**: Interactive proof page with view switcher, OG meta tags for link unfurling, claim text, and verification status
- **`format=png|jpeg|avif|webp`**: Direct image binary for embedding

### Example

```bash
# HTML proof page (opens in browser with view switcher)
curl "https://proof.deepcitation.com/p/xK9mPqR2sT4uV6wY8zA1bC?token=eyJ..."

# Direct image (for embedding in Markdown, chat, etc.)
curl "https://proof.deepcitation.com/p/xK9mPqR2sT4uV6wY8zA1bC?format=png&view=page&token=eyJ..."
```

---

## Error Codes

| Status | Code | Description |
|:-------|:-----|:------------|
| 400 | `invalid-argument` | Missing required parameters or invalid file format |
| 401 | `unauthenticated` | Invalid or expired API key |
| 404 | `not-found` | Attachment not found (may have expired after 30 days) |
| 405 | `method-not-allowed` | Only POST requests are allowed |
| 429 | `resource-exhausted` | Free tier limit exceeded - add a payment method |
| 503 | `service-unavailable` | Temporary service issue - retry with exponential backoff |

---

## Rate Limits & Pricing

### Rate Limits

- 30 day file retention (re-upload if needed)
- 429 status when limit exceeded

### Pricing

- First $10/month free (no credit card required)
- Pay only for what you use
- Volume discounts available

See [full pricing](https://deepcitation.com/pricing) for details.
