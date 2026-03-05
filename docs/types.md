---
layout: default
title: Types
parent: API Reference
nav_order: 1
description: "TypeScript interface definitions for DeepCitation"
---

# Type Definitions

TypeScript interfaces for the DeepCitation SDK and React components.

---

## Citation Types

DeepCitation supports two citation shapes.

```typescript
interface DocumentCitation {
  type?: "document";
  attachmentId?: string;
  pageNumber?: number | null;
  fullPhrase?: string | null;
  anchorText?: string | null;
  lineIds?: number[] | null;
}

interface UrlCitation {
  type: "url";
  url?: string;
  domain?: string;
  title?: string;
  fullPhrase?: string | null;
  anchorText?: string | null;
}

type Citation = DocumentCitation | UrlCitation;
```

---

## VerifyCitationRequest

Request body for `/verifyCitations`.

```typescript
interface VerifyCitationRequest {
  attachmentId: string;
  citations: { [key: string]: Citation };
  outputImageFormat?: "jpeg" | "png" | "avif";
  generateProofUrls?: boolean;
  proofConfig?: {
    access?: "signed" | "workspace" | "public";
    signedUrlExpiry?: "1h" | "24h" | "7d" | "30d" | "90d" | "1y";
    imageFormat?: "png" | "jpeg" | "avif" | "webp";
    includeBase64?: boolean;
  };
  apiKey?: string;
}
```

---

## Verification (SDK)

The SDK normalizes backend responses into this shape.

```typescript
interface Verification {
  status?: SearchStatus | null;
  verifiedMatchSnippet?: string | null;
  searchAttempts?: SearchAttempt[];
  attachmentId?: string | null;
  citation?: Citation;

  document?: DocumentVerificationResult;
  url?: UrlVerificationResult;
  assets?: VerificationAssets;
}

type SearchStatus =
  | "loading"
  | "pending"
  | "not_found"
  | "partial_text_found"
  | "found"
  | "found_anchor_text_only"
  | "found_phrase_missed_anchor_text"
  | "found_on_other_page"
  | "found_on_other_line"
  | "first_word_found"
  | "timestamp_wip"
  | "skipped";

type SearchMethod =
  | "exact_line_match"
  | "line_with_buffer"
  | "expanded_line_buffer"
  | "current_page"
  | "anchor_text_fallback"
  | "adjacent_pages"
  | "expanded_window"
  | "regex_search"
  | "first_word_fallback"
  | "first_half_fallback"
  | "last_half_fallback"
  | "first_quarter_fallback"
  | "second_quarter_fallback"
  | "third_quarter_fallback"
  | "fourth_quarter_fallback"
  | "longest_word_fallback"
  | "custom_phrase_fallback"
  | "keyspan_fallback";

interface SearchAttempt {
  method: SearchMethod;
  success: boolean;
  searchPhrase: string;
  searchPhraseType?: "full_phrase" | "anchor_text";
  regexPattern?: string;
  pageSearched?: number;
  lineSearched?: number | number[];
  searchScope?: "line" | "page" | "document";
  expectedLocation?: { page: number; line?: number };
  foundLocation?: { page: number; line?: number };
  matchedVariation?:
    | "exact_full_phrase"
    | "normalized_full_phrase"
    | "exact_anchor_text"
    | "normalized_anchor_text"
    | "partial_full_phrase"
    | "partial_anchor_text"
    | "first_word_only";
  matchedText?: string;
  deepTextItems?: DeepTextItem[];
  matchScore?: number;
  matchSnippet?: string;
  note?: string;
  durationMs?: number;
  variationType?: "exact" | "normalized" | "currency" | "date" | "numeric" | "symbol" | "accent";
  occurrencesFound?: number;
  matchedExpectedOccurrence?: boolean;
}
```

---

## Verification Assets (DX Model)

Artifacts are intentionally split by purpose so proof links, proof images, page renders, and source downloads are not conflated.

```typescript
interface VerificationAssets {
  documentFiles?: VerificationDocumentAssets;
  proofPage?: ProofPageAsset;
  proofImage?: ProofImageAsset;
  evidenceSnippet?: EvidenceSnippetAsset;
  webCapture?: WebCaptureAsset;
  pageRenders?: PageRenderAsset[];
}

interface ProofPageAsset {
  id?: string;
  url?: string;
}

interface ProofImageAsset {
  url?: string;
  format?: "png" | "jpeg" | "avif" | "webp";
  width?: number;
  height?: number;
}

interface EvidenceSnippetAsset {
  src?: string | null;
  dimensions?: { width: number; height: number } | null;
}

interface WebCaptureAsset {
  src?: string | null;
  capturedAt?: Date | string | null;
}

interface PageRenderAsset {
  pageNumber: number;
  dimensions: { width: number; height: number };
  imageUrl: string;
  thumbnailUrl?: string;
  isMatchPage?: boolean;
}
```

---

## Source vs Verification PDF Downloads

Source downloads are modeled under `verification.assets.documentFiles`.

```typescript
interface DownloadLink {
  url: string;
  expiresAt?: string | "never";
}

interface OriginalFileAsset {
  origin: "upload";
  filename?: string;
  mimeType: string;
  download?: DownloadLink;
}

interface VerificationPdfAsset {
  origin: "upload_pdf" | "converted_from_office" | "converted_from_url";
  sourceUrl?: string;
  filename?: string;
  mimeType: string;
  download?: DownloadLink;
}

interface VerificationDocumentAssets {
  originalFile?: OriginalFileAsset;
  verificationPdf?: VerificationPdfAsset;
}
```

Naming intent:

- `originalFile`: the user-uploaded file (`.docx`, `.xlsx`, `.pdf`, etc.)
- `verificationPdf`: the PDF actually used by DeepCitation verification
- `verificationPdf.origin`: explicit origin of that PDF conversion path

---

## Verify Response

`verifyAttachment()` / `verify()` responses use `documentFiles`, not `downloadUrl`.

```typescript
interface VerifyCitationResponse {
  verifications: { [citationKey: string]: Verification };
  documentFiles?: VerificationDocumentAssets;
}
```

---

## Converted PDF Download Policy (Client)

Controls when converted verification PDF download links are exposed.

```typescript
type ConvertedPdfDownloadPolicy = "url_only" | "always" | "never";
```

Default behavior:

- `"url_only"` (default): converted PDF download links are returned for URL-based conversions, not Office conversions
- `"always"`: converted PDF download links are returned for URL and Office conversions
- `"never"`: converted PDF download links are never returned

Set globally:

```typescript
new DeepCitation({
  apiKey: "...",
  convertedPdfDownloadPolicy: "url_only",
});
```

Override per request on:

- `uploadFile(options)`
- `prepareUrl(options)`
- `convertToPdf(input)`
- `prepareConvertedFile(options)`
- `prepareAttachments([{ ... }])`

---

## React Download Policy (`CitationComponent`)

`CitationComponent` separates source-file download behavior from proof/evidence image download behavior.

```typescript
type CitationDownloadPolicy = "original_only" | "original_plus_url_pdf" | "original_plus_all_pdf";
```

Relevant props:

```typescript
interface CitationComponentProps {
  documentFiles?: VerificationDocumentAssets;
  downloadPolicy?: CitationDownloadPolicy; // default: "original_plus_url_pdf"
  onSourceDownload?: (citation: Citation) => void;
}
```

Default UI behavior:

- `original_plus_url_pdf`: show original upload download when present, and URL-converted PDF download when present
- does not show Office-converted PDF by default
