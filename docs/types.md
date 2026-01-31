---
layout: default
title: Types
nav_order: 5
description: "TypeScript interface definitions for DeepCitation"
---

# Type Definitions

TypeScript interfaces for the DeepCitation API.

---

## Citation

Represents a citation to verify against the source document.

```typescript
interface Citation {
  /** Attachment ID from prepareFile response */
  attachmentId?: string;
  /** Page number where citation should be found (1-indexed) */
  pageNumber?: number | null;
  /** The full phrase to search for in the document */
  fullPhrase?: string | null;
  /** Short value/keyword to verify */
  value?: string | null;
  /** Span of text to search for in the document */
  anchorText?: string | null;
  /** Line IDs for precise location (from promptContent) */
  lineIds?: number[] | null;
  /** Optional reasoning for why this citation was made */
  reasoning?: string | null;
}
```

---

## VerifyCitationRequest

Request body for the /verifyCitations endpoint.

```typescript
interface VerifyCitationRequest {
  /** Attachment ID (from prepareFile response) */
  attachmentId: string;
  /** Map of citation keys to Citation objects */
  citations: { [key: string]: Citation };
  /** Output format for verification images */
  outputImageFormat?: "jpeg" | "png" | "avif";
  /** API key (alternative to Authorization header) */
  apiKey?: string;
}
```

---

## VerifyCitationResponse & Verification

Response from the /verify endpoint with verification results.

```typescript
interface VerifyCitationResponse {
  /** Map of citation keys to verification results */
  verifications: { [key: string]: Verification };
}

interface Verification {
  /** Page number where citation was found (1-indexed) */
  pageNumber?: number | null;
  /** The search term used (lowercase) */
  lowerCaseSearchTerm: string | null;
  /** Text snippet showing match context */
  matchSnippet?: string | null;
  /** Base64-encoded verification image */
  verificationImageBase64?: string | null;
  /** Verification status */
  searchState?: SearchState | null;
  /** When this citation was verified */
  verifiedAt?: Date;
  /** The original citation object */
  citation?: Citation;
}

interface SearchState {
  status: SearchStatus;
  expectedPage?: number | null;
  actualPage?: number | null;
  expectedLineIds?: number[] | null;
  actualLineIds?: number[] | null;
  expectedTimestamps?: { startTime?: string; endTime?: string };
  actualTimestamps?: { startTime?: string; endTime?: string };
  searchAttempts?: SearchAttempt[]; // Track all search attempts
}

interface SearchAttempt {
  method: SearchMethod;
  success: boolean;
  searchPhrases: string[]; // The actual phrase(s) searched for
  pageSearched?: number;
  matchScore?: number; // For BM25 and other scoring methods
  matchSnippet?: string;
  notes?: string; // Additional context about why it failed/succeeded
  durationMs?: number; // Time taken in milliseconds
  startTime?: number; // Timestamp when search started
  endTime?: number; // Timestamp when search ended
}

type SearchStatus =
  | "found"              // Exact match found
  | "partial_text_found" // Partial match found
  | "not_found"          // No match found
  | "found_anchor_text_only"   // Only the value matched, not full phrase
  | "found_on_other_page" // Found on different page than expected
  | "found_on_other_line" // Found on different line than expected
  | "first_word_found" // Found the first word of the phrase
  | "pending";           // Still processing
```

---

## PrepareFileResponse

Response from the /prepareFile endpoint after processing a document.

```typescript
interface PrepareFileResponse {
  /** System-generated attachment ID for verification calls */
  attachmentId: string;
  /** Full text content with page markers and line IDs. Use this in wrapCitationPrompt(). */
  deepTextPromptPortion: string;
  /** File metadata */
  metadata: {
    filename: string;
    mimeType: string;
    pageCount: number;
    textByteSize: number;
  };
  /** Processing status */
  status: "ready" | "error";
  /** Processing time in milliseconds */
  processingTimeMs?: number;
  /** Error message if status is "error" */
  error?: string;
}
```

---

## Component Types

Types used by the React CitationComponent.

### CitationStatus

```typescript
interface CitationStatus {
  isVerified: boolean;    // Citation was found (exact or partial)
  isPartialMatch: boolean; // Found but text differs
  isMiss: boolean;        // Not found in document
  isPending: boolean;     // Verification in progress
}
```

### CitationEventHandlers

```typescript
// Event handlers for side effects (disables default behaviors when provided)
interface CitationEventHandlers {
  onMouseEnter?: (citation: Citation, citationKey: string) => void;
  onMouseLeave?: (citation: Citation, citationKey: string) => void;
  onClick?: (citation: Citation, citationKey: string, event: React.MouseEvent | React.TouchEvent) => void;
  onTouchEnd?: (citation: Citation, citationKey: string, event: React.TouchEvent) => void;
}
```

### CitationBehaviorConfig

```typescript
// Configuration for customizing default behaviors (replaces defaults)
interface CitationBehaviorConfig {
  onClick?: CitationClickBehavior;
  onHover?: CitationHoverBehavior;
}

// Context provided to behavior handlers
interface CitationBehaviorContext {
  citation: Citation;
  citationKey: string;
  verification: Verification | null;
  isTooltipExpanded: boolean;
  isImageExpanded: boolean;
  hasImage: boolean;
}

// Actions that can be returned from behavior handlers
interface CitationBehaviorActions {
  setTooltipExpanded?: boolean;      // Pin/unpin popover
  setImageExpanded?: boolean | string; // Open/close image overlay
  setPhrasesExpanded?: boolean;      // Expand search phrases list
}

type CitationClickBehavior = (
  context: CitationBehaviorContext,
  event: React.MouseEvent | React.TouchEvent
) => CitationBehaviorActions | false | void;

interface CitationHoverBehavior {
  onEnter?: (context: CitationBehaviorContext) => void;
  onLeave?: (context: CitationBehaviorContext) => void;
}
```

### CitationRenderProps

```typescript
// Props passed to custom renderContent function
interface CitationRenderProps {
  citation: Citation;
  status: CitationStatus;
  citationKey: string;
  displayText: string;
  isMergedDisplay: boolean;
}
```
