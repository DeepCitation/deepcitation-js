<div align="center">

# @deepcitation/deepcitation-js

**Deterministic AI citation verification. Eliminate hallucination risk by proving every AI citation against source documents.**

[![npm version](https://img.shields.io/npm/v/@deepcitation/deepcitation-js.svg)](https://www.npmjs.com/package/@deepcitation/deepcitation-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

[Documentation](https://deepcitation.com/docs) · [Get Free API Key](https://deepcitation.com/signup) · [Examples](./examples) · [Discord](https://discord.gg/deepcitation)

</div>

---

## Why DeepCitation?

LLMs hallucinate. Even when given source documents, they make up quotes, invent statistics, and cite pages that don't exist. DeepCitation solves this by **deterministically verifying every citation** against your source documents—and generating visual proof.

```
Before: "Revenue grew 45% [1]"  →  ❓ Did the LLM make this up?
After:  "Revenue grew 45% [1]"  →  ✅ Verified on page 3, line 12 (with screenshot)
```

## Features

| Feature | Description |
|---------|-------------|
| **Deterministic Matching** | Every citation is traced to its exact location. No fuzzy matching, no guessing—just proof. |
| **Visual Proof Generation** | Automated screenshots with highlighted text show exactly where each citation comes from. |
| **Any LLM Provider** | Works with OpenAI, Anthropic, Google, Azure, or your own models. |
| **React Components** | 7 pre-built components + composable primitives for building citation UIs. |
| **TypeScript Native** | Full type safety with comprehensive type definitions. |

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Examples](#examples)
- [API Reference](#api-reference)
- [API Response Types](#api-response-types)
- [Integration Patterns](#integration-patterns)
- [Error Handling](#error-handling)
- [React Components](#react-components)
- [Types](#types)
- [Supported File Types](#supported-file-types)
- [Contributing](#contributing)

## Installation

```bash
npm install @deepcitation/deepcitation-js
```

```bash
yarn add @deepcitation/deepcitation-js
```

```bash
bun add @deepcitation/deepcitation-js
```

## Get Your API Key

Get a free API key at [deepcitation.com](https://deepcitation.com/signup) — no credit card required.

```bash
# .env
DEEPCITATION_API_KEY=dc_live_your_api_key_here
```

---

## Quick Start

DeepCitation works in three steps: **Pre-Prompt**, **Post-Prompt**, and **Display**.

### Step 1: Pre-Prompt

Before calling your LLM, upload source documents and enhance your prompt with citation instructions.

```typescript
import { DeepCitation, wrapCitationPrompt } from "@deepcitation/deepcitation-js";

const deepcitation = new DeepCitation({ apiKey: process.env.DEEPCITATION_API_KEY });

// Upload source files and get structured content
const { fileDataParts, fileDeepTexts } = await deepcitation.prepareFiles([
  { file: pdfBuffer, filename: "report.pdf" },
  { file: invoiceBuffer, filename: "invoice.pdf" },
]);

// Wrap your prompts with citation instructions (fileDeepText handles file content)
const systemPrompt = `You are a helpful financial analyst...`;

const { enhancedSystemPrompt, enhancedUserPrompt } = wrapCitationPrompt({
  systemPrompt,
  userPrompt: userMessage,
  fileDeepText: fileDeepTexts, // Pass single string or array for multi-file
});

// Call your LLM as usual
const response = await llm.chat({
  messages: [
    { role: "system", content: enhancedSystemPrompt },
    { role: "user", content: enhancedUserPrompt },
  ],
});
```

### Step 2: Post-Prompt

After receiving the LLM response, verify citations against the source documents.

```typescript
// Verify all citations from LLM output in one call
const result = await deepcitation.verifyCitations({
  llmOutput: response.content,
  fileDataParts, // For Zero Data Retention or after storage expires (30 days)
});

// result.citations contains verification status + visual proof
// { "1": { status: "found", imageBase64: "...", matchSnippet: "..." }, ... }
```

### Step 3: Display

Render verified citations with React components.

```tsx
import { CitationComponent } from "@deepcitation/deepcitation-js/react";

function Response({ text, citations, verifications }) {
  return (
    <p>
      Revenue grew by
      <CitationComponent
        citation={citations["1"]}
        foundCitation={verifications["1"]}
      />
      this quarter.
    </p>
  );
}
```

---

## Examples

Check out the [examples directory](./examples) for complete, runnable examples:

| Example | Description | Use Case |
|---------|-------------|----------|
| [**basic-verification**](./examples/basic-verification) | Core 3-step workflow with OpenAI or Anthropic | Learning the basics, simple integrations |
| [**support-bot**](./examples/support-bot) | Customer support bot with invisible citations | Production apps, customer-facing AI |
| [**nextjs-ai-sdk**](./examples/nextjs-ai-sdk) | Next.js chat app with Vercel AI SDK | Full-stack apps, streaming UI |

```bash
# Run the basic example
cd examples/basic-verification
npm install
cp .env.example .env  # Add your API keys
npm run start:openai

# Or run the Next.js example
cd examples/nextjs-ai-sdk
npm install
npm run dev
```

---

## API Reference

### DeepCitation Client

```typescript
import { DeepCitation } from "@deepcitation/deepcitation-js";

const dc = new DeepCitation({
  apiKey: string;      // Required: Your API key (dc_live_* or dc_test_*)
  apiUrl?: string;     // Optional: Custom API URL (default: https://api.deepcitation.com)
});
```

#### `prepareFiles(files)`

Upload source documents and get structured text for LLM prompts.

```typescript
const { fileDataParts, fileDeepTexts } = await dc.prepareFiles([
  { file: pdfBuffer, filename: "report.pdf" },
  { file: imageBlob, filename: "chart.png" },
]);

// fileDataParts: Array of file references (use with verifyCitations)
// fileDeepTexts: Array of formatted text strings with page markers and line IDs
```

**Supported file types:**
- PDF documents (native and scanned)
- Images (PNG, JPEG, TIFF, WebP, AVIF, HEIC)

#### `convertToPdf(input)`

Convert a URL or Office document to PDF for citation verification.

```typescript
// Convert a URL (shorthand)
const result = await dc.convertToPdf("https://example.com/article");

// Convert a URL with options
const result = await dc.convertToPdf({
  url: "https://example.com/article",
  singlePage: true,  // Render as single long page instead of paginated
});

// Convert an Office document
const result = await dc.convertToPdf({
  file: docxBuffer,      // File, Blob, or Buffer
  filename: "report.docx",
  fileId: "my-custom-id", // Optional custom file ID
});

// result: { fileId, metadata, status }
```

**Supported formats:**
- URLs: Any publicly accessible web page or direct PDF link
- Office: `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.odt`, `.ods`, `.odp`, `.rtf`, `.csv`

#### `prepareConvertedFile(options)`

Process a previously converted file for citation verification. Use this after `convertToPdf()`.

```typescript
// Convert first
const converted = await dc.convertToPdf("https://example.com/article");

// Then prepare for verification
const { fileDeepText, fileId } = await dc.prepareConvertedFile({
  fileId: converted.fileId,
});

// fileDeepText is ready for LLM prompts (pass to wrapCitationPrompt)
// fileId can be used for verifyCitations()
```

#### `verifyCitations(options)`

Verify citations from LLM output against source documents.

```typescript
const result = await dc.verifyCitations({
  llmOutput: string;           // The LLM response containing citations
  fileDataParts?: FileData[];  // Optional: File references for verification
  outputImageFormat?: "jpeg" | "png" | "avif";  // Optional: Image format (default: "avif")
});

// Returns: { citations: Record<string, VerificationResult> }
```

### Prompt Utilities

#### `wrapCitationPrompt(options)`

Wrap both system and user prompts with citation instructions.

```typescript
import { wrapCitationPrompt } from "@deepcitation/deepcitation-js";

const { enhancedSystemPrompt, enhancedUserPrompt } = wrapCitationPrompt({
  systemPrompt: "You are a helpful assistant...",
  userPrompt: "Analyze this document",
  fileDeepText: fileDeepTexts, // Single string or array for multi-file
});

// fileDeepText is automatically wrapped in <file_text> tags
// For multiple files, each is tagged with file_index
```

#### `wrapSystemCitationPrompt(options)`

Wrap only the system prompt with citation instructions (for more control).

```typescript
import { wrapSystemCitationPrompt } from "@deepcitation/deepcitation-js";

const enhanced = wrapSystemCitationPrompt({
  systemPrompt: "You are a helpful assistant...",
  isAudioVideo?: boolean,  // Use timestamp-based citations
  prependCitationInstructions?: boolean,  // Add instructions before prompt
});
```

#### `getAllCitationsFromLlmOutput(llmOutput)`

Extract citations from LLM response (supports both XML `<cite>` tags and JSON formats).

```typescript
import { getAllCitationsFromLlmOutput } from "@deepcitation/deepcitation-js";

const citations = getAllCitationsFromLlmOutput(llmResponse);
// { "1": { pageNumber: 1, lineId: "L1", fullPhrase: "..." }, ... }
```

#### Multi-File Utilities

```typescript
import { groupCitationsByFileId } from "@deepcitation/deepcitation-js";

// Group citations by fileId for multi-file verification
const citationsByFile = groupCitationsByFileId(citations);
// Returns: Map<string, { [key: string]: Citation }>

// Object version for easier serialization
const citationsByFileObj = groupCitationsByFileIdObject(citations);
// Returns: { [fileId: string]: { [key: string]: Citation } }
```

#### Cleanup Utilities

```typescript
import {
  removeCitations,
  removePageNumberMetadata,
  removeLineIdMetadata,
} from "@deepcitation/deepcitation-js";

// Remove citation tags (optionally keep values)
const clean = removeCitations(text, leaveValue?: boolean);

// Remove page number metadata tags
const noPages = removePageNumberMetadata(text);

// Remove line ID metadata tags
const noLines = removeLineIdMetadata(text);
```

### JSON Output Format

For LLMs with structured output support:

```typescript
import { CITATION_JSON_OUTPUT_FORMAT } from "@deepcitation/deepcitation-js";

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [...],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "analysis",
      schema: {
        type: "object",
        properties: {
          findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                citation: CITATION_JSON_OUTPUT_FORMAT,
              },
            },
          },
        },
      },
    },
  },
});
```

---

## API Response Types

### Verification Response Structure

When you call `verifyCitations()`, you receive a structured response containing verification results for each citation:

```typescript
interface VerifyCitationsResponse {
  citations: Record<string, FoundHighlightLocation>;
}
```

Each citation key maps to a `FoundHighlightLocation` object:

```typescript
interface FoundHighlightLocation {
  // Verification result
  searchState: SearchState;              // Contains status and location details

  // Location information
  pageNumber?: number | null;            // Page where citation was found
  matchSnippet?: string | null;          // Text snippet of the matched content
  lowerCaseSearchTerm?: string | null;   // The search term used for matching

  // Visual proof
  verificationImageBase64?: string | null;  // Base64-encoded screenshot
  verificationImageUrl?: string | null;     // URL to hosted image (if configured)

  // Metadata
  verifiedAt?: Date;                     // Timestamp of verification
  source?: string | null;                // Verification engine version

  // Original citation data
  citation?: Citation;                   // The original citation object
}
```

### SearchState and Status Values

The `SearchState` object contains the verification result:

```typescript
interface SearchState {
  status: SearchStatus;

  // Page location comparison
  expectedPage?: number | null;      // Page claimed by LLM
  actualPage?: number | null;        // Page where text was actually found

  // Line location comparison
  expectedLineIds?: number[] | null; // Line IDs claimed by LLM
  actualLineIds?: number[] | null;   // Actual line IDs where text was found

  // For audio/video citations
  expectedTimestamps?: { startTime?: string; endTime?: string };
  actualTimestamps?: { startTime?: string; endTime?: string };
}
```

### SearchStatus Reference

| Status | Description | `isVerified` | `isPartialMatch` | Recommended Action |
|--------|-------------|--------------|------------------|-------------------|
| `"found"` | Exact match at expected location | ✅ `true` | `false` | Display with full confidence |
| `"found_value_only"` | Citation value found, but not exact phrase | ✅ `true` | `false` | Display, phrase may be paraphrased |
| `"found_phrase_missed_value"` | Exact phrase found, value mismatch | ✅ `true` | `false` | Display, minor discrepancy |
| `"partial_text_found"` | Part of the citation text was found | ✅ `true` | ✅ `true` | Display with partial indicator |
| `"found_on_other_page"` | Text found on different page | ✅ `true` | ✅ `true` | Display, page number was wrong |
| `"found_on_other_line"` | Text found on different line | ✅ `true` | ✅ `true` | Display, line reference was off |
| `"first_word_found"` | Only first word matched | ✅ `true` | ✅ `true` | Display with caution indicator |
| `"not_found"` | Citation not found in document | ❌ `false` | `false` | Hide, retry, or flag for review |
| `"pending"` | Page still being processed | pending | `false` | Show loading state, poll for update |
| `"loading"` | Verification in progress | pending | `false` | Show loading state |
| `"timestamp_wip"` | Audio/video timestamp verification in progress | pending | `false` | Show loading state |

### CitationStatus Helper

Use `getCitationStatus()` to get a simplified status object:

```typescript
import { getCitationStatus } from "@deepcitation/deepcitation-js";

const status = getCitationStatus(foundHighlight);

// status: CitationStatus
{
  isVerified: boolean;    // true if citation is trustworthy (found, partial, or value-only)
  isMiss: boolean;        // true only if status === "not_found"
  isPartialMatch: boolean; // true for partial matches (other page/line, partial text)
  isPending: boolean;     // true if still loading or pending
}
```

---

## Integration Patterns

### Pattern 1: Retry Logic for Unverified Citations

When citations fail verification, you may want to retry with the LLM or flag for human review:

```typescript
import { DeepCitation, getCitationStatus } from "@deepcitation/deepcitation-js";

async function verifyWithRetry(
  dc: DeepCitation,
  llmOutput: string,
  fileDataParts: FileDataPart[],
  maxRetries = 2
) {
  const result = await dc.verifyCitations({ llmOutput, fileDataParts });

  const unverifiedCitations: string[] = [];
  const verifiedCitations: Record<string, FoundHighlightLocation> = {};

  for (const [key, highlight] of Object.entries(result.citations)) {
    const status = getCitationStatus(highlight);

    if (status.isMiss) {
      unverifiedCitations.push(key);
    } else {
      verifiedCitations[key] = highlight;
    }
  }

  // Option 1: Flag unverified citations for human review
  if (unverifiedCitations.length > 0) {
    await flagForReview(unverifiedCitations, llmOutput);
  }

  // Option 2: Ask LLM to regenerate with stricter instructions
  if (unverifiedCitations.length > 0 && maxRetries > 0) {
    const regenerated = await regenerateWithStricterPrompt(
      unverifiedCitations,
      fileDataParts
    );
    return verifyWithRetry(dc, regenerated, fileDataParts, maxRetries - 1);
  }

  return { verifiedCitations, unverifiedCitations };
}
```

### Pattern 2: Invisible Citations (Support Bots & Customer-Facing Apps)

For customer support bots where you want verified information without showing citation markers:

```typescript
import {
  DeepCitation,
  wrapCitationPrompt,
  removeCitations,
  getCitationStatus
} from "@deepcitation/deepcitation-js";

async function generateVerifiedResponse(userQuestion: string, documents: File[]) {
  const dc = new DeepCitation({ apiKey: process.env.DEEPCITATION_API_KEY });

  // Step 1: Prepare files and prompt (citations are generated internally)
  const { fileDataParts, fileDeepTexts } = await dc.prepareFiles(
    documents.map(f => ({ file: f, filename: f.name }))
  );

  const { enhancedSystemPrompt, enhancedUserPrompt } = wrapCitationPrompt({
    systemPrompt: "You are a helpful support agent...",
    userPrompt: userQuestion,
    fileDeepText: fileDeepTexts, // Automatically wrapped in <file_text> tags
  });

  // Step 2: Get LLM response with citations
  const llmResponse = await callYourLLM(enhancedSystemPrompt, enhancedUserPrompt);

  // Step 3: Verify citations
  const result = await dc.verifyCitations({
    llmOutput: llmResponse,
    fileDataParts
  });

  // Step 4: Calculate confidence score
  const citations = Object.values(result.citations);
  const verifiedCount = citations.filter(c => getCitationStatus(c).isVerified).length;
  const confidenceScore = citations.length > 0
    ? verifiedCount / citations.length
    : 0;

  // Step 5: Return clean response (no visible citations) with metadata
  return {
    // Remove citation tags for clean customer-facing text
    response: removeCitations(llmResponse, false),

    // Include confidence for internal monitoring/logging
    confidence: confidenceScore,
    totalCitations: citations.length,
    verifiedCitations: verifiedCount,

    // Store verification details for audit/debugging
    verificationDetails: result.citations,
  };
}
```

### Pattern 3: Conditional Rendering Based on Verification Status

Show different UI treatments based on citation quality:

```typescript
import { getCitationStatus, type FoundHighlightLocation } from "@deepcitation/deepcitation-js";

function CitationWithQualityIndicator({
  citation,
  foundCitation
}: {
  citation: Citation;
  foundCitation: FoundHighlightLocation | null;
}) {
  const status = getCitationStatus(foundCitation);

  // Fully verified - show with confidence
  if (status.isVerified && !status.isPartialMatch) {
    return (
      <span className="citation verified">
        [{citation.citationNumber}] <VerifiedBadge />
      </span>
    );
  }

  // Partial match - show with warning
  if (status.isPartialMatch) {
    return (
      <span className="citation partial" title="Citation found with minor discrepancies">
        [{citation.citationNumber}] <PartialMatchIcon />
      </span>
    );
  }

  // Still loading
  if (status.isPending) {
    return (
      <span className="citation loading">
        [{citation.citationNumber}] <Spinner size="xs" />
      </span>
    );
  }

  // Not found - hide or show warning
  if (status.isMiss) {
    // Option A: Hide unverified citations entirely
    return null;

    // Option B: Show with strong warning
    return (
      <span className="citation unverified" title="Could not verify this citation">
        [{citation.citationNumber}] <WarningIcon />
      </span>
    );
  }

  return <span>[{citation.citationNumber}]</span>;
}
```

### Pattern 4: Streaming Response with Progressive Verification

Verify citations as they stream in from the LLM:

```typescript
import {
  DeepCitation,
  getAllCitationsFromLlmOutput,
  getCitationStatus
} from "@deepcitation/deepcitation-js";

async function* streamWithVerification(
  dc: DeepCitation,
  fileDataParts: FileDataPart[],
  llmStream: AsyncIterable<string>
) {
  let fullOutput = "";
  let lastVerifiedCount = 0;
  const verifiedCitations: Record<string, FoundHighlightLocation> = {};

  for await (const chunk of llmStream) {
    fullOutput += chunk;
    yield { type: "content", content: chunk };

    // Extract citations found so far
    const citations = getAllCitationsFromLlmOutput(fullOutput);
    const citationCount = Object.keys(citations).length;

    // New citations detected - verify them
    if (citationCount > lastVerifiedCount) {
      const result = await dc.verifyCitations({
        llmOutput: fullOutput,
        fileDataParts,
      });

      // Yield verification updates
      for (const [key, highlight] of Object.entries(result.citations)) {
        if (!verifiedCitations[key]) {
          verifiedCitations[key] = highlight;
          yield {
            type: "verification",
            citationKey: key,
            status: getCitationStatus(highlight),
            highlight
          };
        }
      }

      lastVerifiedCount = citationCount;
    }
  }

  yield { type: "complete", verifiedCitations };
}

// Usage
const stream = streamWithVerification(dc, fileDataParts, llmStream);
for await (const event of stream) {
  if (event.type === "content") {
    appendToUI(event.content);
  } else if (event.type === "verification") {
    updateCitationStatus(event.citationKey, event.status);
  }
}
```

### Pattern 5: Batch Processing with Quality Gates

Process multiple documents with minimum verification thresholds:

```typescript
interface ProcessingResult {
  documentId: string;
  response: string;
  verificationRate: number;
  passed: boolean;
  citations: Record<string, FoundHighlightLocation>;
}

async function batchProcessWithQualityGate(
  documents: { id: string; file: File; question: string }[],
  minimumVerificationRate = 0.8  // 80% of citations must verify
): Promise<ProcessingResult[]> {
  const dc = new DeepCitation({ apiKey: process.env.DEEPCITATION_API_KEY });
  const results: ProcessingResult[] = [];

  for (const doc of documents) {
    const { fileDataParts, fileDeepTexts } = await dc.prepareFiles([
      { file: doc.file, filename: doc.file.name }
    ]);

    const llmResponse = await generateResponse(doc.question, fileDeepTexts);

    const verification = await dc.verifyCitations({
      llmOutput: llmResponse,
      fileDataParts,
    });

    const citations = Object.values(verification.citations);
    const verifiedCount = citations.filter(
      c => getCitationStatus(c).isVerified
    ).length;
    const verificationRate = citations.length > 0
      ? verifiedCount / citations.length
      : 1;

    results.push({
      documentId: doc.id,
      response: llmResponse,
      verificationRate,
      passed: verificationRate >= minimumVerificationRate,
      citations: verification.citations,
    });
  }

  // Log quality metrics
  const passRate = results.filter(r => r.passed).length / results.length;
  console.log(`Batch quality: ${(passRate * 100).toFixed(1)}% passed threshold`);

  return results;
}
```

### Pattern 6: Handling Page/Line Discrepancies

When citations are found but on different pages or lines:

```typescript
function analyzeLocationDiscrepancy(highlight: FoundHighlightLocation) {
  const { searchState } = highlight;

  if (searchState?.status === "found_on_other_page") {
    return {
      type: "page_mismatch",
      message: `Citation found on page ${searchState.actualPage} (expected page ${searchState.expectedPage})`,
      severity: "low",  // Content is verified, just wrong page reference
      suggestion: "LLM may have miscounted pages or document has different pagination",
    };
  }

  if (searchState?.status === "found_on_other_line") {
    return {
      type: "line_mismatch",
      message: `Citation found on lines ${searchState.actualLineIds?.join(", ")} (expected ${searchState.expectedLineIds?.join(", ")})`,
      severity: "low",
      suggestion: "Line numbers shifted, but content is verified",
    };
  }

  if (searchState?.status === "partial_text_found") {
    return {
      type: "partial_match",
      message: `Only part of the cited text was found: "${highlight.matchSnippet}"`,
      severity: "medium",
      suggestion: "LLM may have paraphrased or combined text from multiple locations",
    };
  }

  return null;
}
```

---

## Error Handling

### API Errors

```typescript
try {
  const result = await dc.verifyCitations({ llmOutput, fileDataParts });
} catch (error) {
  if (error.code === "unauthenticated") {
    // Invalid or expired API key
    console.error("Invalid API key. Get a new one at deepcitation.com");
  } else if (error.code === "payment-required") {
    // Usage limits exceeded
    console.error("Free tier exhausted. Add payment method to continue.");
  } else if (error.code === "invalid-argument") {
    // Bad request (malformed citations, invalid file references)
    console.error("Invalid request:", error.message);
  } else if (error.code === "not-found") {
    // File not found (expired or never uploaded)
    console.error("File not found. Files expire after 30 days.");
  } else {
    // Network or internal error - safe to retry
    console.error("Temporary error, retrying...", error);
    await delay(1000);
    return dc.verifyCitations({ llmOutput, fileDataParts });
  }
}
```

### Graceful Degradation

When verification fails, fall back to showing unverified citations:

```typescript
async function verifyWithFallback(
  dc: DeepCitation,
  llmOutput: string,
  fileDataParts: FileDataPart[]
) {
  try {
    return await dc.verifyCitations({ llmOutput, fileDataParts });
  } catch (error) {
    console.warn("Verification unavailable, showing unverified citations");

    // Parse citations without verification
    const citations = getAllCitationsFromLlmOutput(llmOutput);

    // Return mock "pending" status for all citations
    return {
      citations: Object.fromEntries(
        Object.entries(citations).map(([key, citation]) => [
          key,
          {
            citation,
            searchState: { status: "pending" as const },
            verificationImageBase64: null,
          }
        ])
      )
    };
  }
}
```

---

## React Components

### Pre-built Components

```tsx
import {
  CitationComponent,
  ChipCitation,
  SuperscriptCitation,
  FootnoteCitation,
  InlineCitation,
  MinimalCitation,
  UrlCitationComponent,
} from "@deepcitation/deepcitation-js/react";

// Classic bracket style [1]
<CitationComponent
  citation={citation}
  foundCitation={verificationResult}
  displayCitationValue={true}
  eventHandlers={{
    onClick: (citation, key, e) => scrollToSource(citation),
    onMouseEnter: (citation, key) => showPreview(citation),
  }}
/>

// Chip/badge style
<ChipCitation citation={citation} foundCitation={result} size="md" />

// Superscript style (academic)
<SuperscriptCitation citation={citation} foundCitation={result} />

// Footnote marker style
<FootnoteCitation citation={citation} symbolStyle="asterisk" />

// Inline with subtle underline
<InlineCitation citation={citation} underlineStyle="dotted" />

// Minimal - just the number
<MinimalCitation citation={citation} showStatusIndicator={true} />
```

### Composable Primitives

Build custom citation components using composable primitives:

```tsx
import { Citation, useCitationContext } from "@deepcitation/deepcitation-js/react";

function CustomCitation({ citation, foundCitation, onClick }) {
  return (
    <Citation.Root citation={citation} foundCitation={foundCitation}>
      <Citation.Trigger onCitationClick={onClick}>
        <Citation.Bracket>
          <Citation.Number />
          <Citation.Indicator />
        </Citation.Bracket>
      </Citation.Trigger>
    </Citation.Root>
  );
}

// Custom chip-style
function ChipCitation({ citation, foundCitation }) {
  return (
    <Citation.Root citation={citation} foundCitation={foundCitation}>
      <Citation.Trigger className="px-2 py-0.5 rounded-full bg-blue-100">
        <Citation.Value separator="" />
        <Citation.Bracket open="[" close="]">
          <Citation.Number />
        </Citation.Bracket>
        <Citation.Indicator
          verifiedIndicator={<CheckIcon />}
          partialIndicator={<AlertIcon />}
        />
      </Citation.Trigger>
    </Citation.Root>
  );
}

// Status-aware rendering
function StatusCitation({ citation, foundCitation }) {
  return (
    <Citation.Root citation={citation} foundCitation={foundCitation}>
      <Citation.Status>
        {(status) => (
          <span className={status.isVerified ? "text-green-600" : "text-gray-500"}>
            <Citation.Trigger>
              <Citation.Phrase maxLength={50} />
              {status.isVerified && " ✓"}
            </Citation.Trigger>
          </span>
        )}
      </Citation.Status>
    </Citation.Root>
  );
}
```

### Available Primitives

| Primitive | Description |
|-----------|-------------|
| `Citation.Root` | Context provider, wraps all other primitives |
| `Citation.Trigger` | Interactive element with event handlers |
| `Citation.Bracket` | Renders brackets around content |
| `Citation.Number` | Displays citation number |
| `Citation.Value` | Displays citation value/summary |
| `Citation.Indicator` | Status indicator (✓, *, etc.) |
| `Citation.Status` | Render prop for accessing status |
| `Citation.Phrase` | Displays full phrase with truncation |
| `Citation.Page` | Displays page number |

### Hooks

```typescript
import { useCitationContext, useCitationContextSafe } from "@deepcitation/deepcitation-js/react";

// Must be inside Citation.Root
const { citation, status, citationKey } = useCitationContext();

// Safe version (returns null if not in context)
const context = useCitationContextSafe();
```

---

## Styling

### CSS Import

```css
@import "@deepcitation/deepcitation-js/react/styles.css";
```

### CSS Custom Properties

```css
:root {
  --citation-color-verified: #22c55e;
  --citation-color-partial: #eab308;
  --citation-color-miss: #ef4444;
  --citation-color-pending: #9ca3af;
  --citation-color-primary: #3b82f6;

  --citation-bg-verified: rgba(34, 197, 94, 0.1);
  --citation-bg-partial: rgba(234, 179, 8, 0.1);
  --citation-bg-miss: rgba(239, 68, 68, 0.1);

  --citation-font-size-sm: 0.75em;
  --citation-font-size-md: 0.875em;
  --citation-border-radius: 9999px;
}
```

---

## Types

### Core Types

```typescript
// Citation extracted from LLM output
interface Citation {
  fileId?: string;                                // Document identifier
  startPageKey?: string | null;                   // Page key format: "page_number_PAGE_index_INDEX"
  pageNumber?: number | null;                     // Page number (1-indexed)
  fullPhrase?: string | null;                     // Exact verbatim text from source
  value?: string | null;                          // Citation value/summary
  lineIds?: number[] | null;                      // Line numbers in document
  reasoning?: string | null;                      // LLM's reasoning for citation
  citationNumber?: number;                        // Sequential citation number
  beforeCite?: string;                            // Text before <cite> tag
  selection?: ScreenBox | null;                   // Bounding box coordinates
  formFieldName?: string | null;                  // Form field name (for form documents)
  formFieldValue?: string | null;                 // Form field value
  timestamps?: {                                  // For audio/video citations
    startTime?: string;                           // Format: "HH:MM:SS.SSS"
    endTime?: string;
  };
}

// Verification result for a citation
interface FoundHighlightLocation {
  searchState: SearchState;                       // Verification status and details
  pageNumber?: number | null;                     // Page where citation was found
  matchSnippet?: string | null;                   // Matched text snippet
  lowerCaseSearchTerm?: string | null;            // Search term used
  verificationImageBase64?: string | null;        // Base64 screenshot proof
  verificationImageUrl?: string | null;           // Hosted image URL
  verifiedAt?: Date;                              // Verification timestamp
  source?: string | null;                         // Engine version
  citation?: Citation;                            // Original citation data
  label?: string | null;                          // e.g., "Invoice", "Contract"
  hitIndexWithinPage?: number | null;             // Match index on page
  pdfSpaceItem?: PdfSpaceItem;                    // PDF coordinate data
}

// Verification status with location comparison
interface SearchState {
  status: SearchStatus;                           // Verification result
  expectedPage?: number | null;                   // Page claimed by LLM
  actualPage?: number | null;                     // Page where found
  expectedLineIds?: number[] | null;              // Lines claimed by LLM
  actualLineIds?: number[] | null;                // Actual lines
  expectedTimestamps?: { startTime?: string; endTime?: string };
  actualTimestamps?: { startTime?: string; endTime?: string };
}

// All possible verification statuses
type SearchStatus =
  | "found"                     // ✓ Exact match at expected location
  | "found_value_only"          // Found value, phrase differs
  | "found_phrase_missed_value" // Found phrase, value differs
  | "partial_text_found"        // Partial text match
  | "found_on_other_page"       // Found on different page
  | "found_on_other_line"       // Found on different line
  | "first_word_found"          // Only first word matched
  | "not_found"                 // ✗ Citation not found
  | "pending"                   // Page processing, will retry
  | "loading"                   // Verification in progress
  | "timestamp_wip";            // Audio/video timestamp processing

// Simplified status for UI logic
interface CitationStatus {
  isVerified: boolean;          // Trustworthy citation
  isMiss: boolean;              // Not found in document
  isPartialMatch: boolean;      // Found with discrepancies
  isPending: boolean;           // Still processing
}
```

### File Upload Types

```typescript
// File upload response
interface UploadFileResponse {
  fileId: string;                                 // Unique file identifier (custom or auto-generated)
  fileDeepText: string;                           // Formatted text for LLM with page markers and line IDs
  formFields?: Array<{                            // Extracted form fields (for PDF forms)
    name: string;
    value?: string;
    pageIndex?: number;
    type?: string;
  }>;
  metadata: {
    filename: string;
    mimeType: string;
    pageCount: number;
    textByteSize: number;
  };
  status: "ready" | "error";
  processingTimeMs?: number;
  error?: string;
}

// File reference for verification (opaque - pass directly to verifyCitations)
interface FileDataPart {
  fileId: string;
}

// Result from prepareFiles()
interface PrepareFilesResult {
  fileDataParts: FileDataPart[];                  // Pass to verifyCitations()
  fileDeepTexts: string[];                        // Pass to wrapCitationPrompt({ fileDeepText })
}
```

### Conversion Types

```typescript
// Input for convertToPdf()
interface ConvertFileInput {
  url?: string;                                   // URL to convert to PDF
  file?: File | Blob | Buffer;                    // Office file to convert
  filename?: string;                              // Custom filename
  fileId?: string;                                // Custom file ID
  singlePage?: boolean;                           // For URLs: single long page
}

// Response from convertToPdf()
interface ConvertFileResponse {
  fileId: string;                                 // Use with prepareConvertedFile()
  metadata: {
    originalFilename: string;                     // Original filename
    originalMimeType: string;                     // Original MIME type
    convertedMimeType: string;                    // Always "application/pdf"
    conversionTimeMs: number;                     // Conversion duration
  };
  status: "converted" | "error";
  error?: string;
}

// Options for prepareConvertedFile()
interface PrepareConvertedFileOptions {
  fileId: string;                                 // From convertToPdf()
}
```

### Geometry Types

```typescript
interface ScreenBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PdfSpaceItem extends ScreenBox {
  text?: string;
}
```

---

## Supported File Types

### Direct Upload (via `prepareFiles()` or `uploadFile()`)

- PDF documents (native and scanned with OCR)
- Images (PNG, JPEG, TIFF, WebP, AVIF, HEIC)

### URL Conversion (via `convertToPdf()`)

Convert any publicly accessible URL to PDF for citation verification:

- Web pages (HTML rendered to PDF)
- Direct PDF links (downloaded and processed)

### Office Documents (via `convertToPdf()`)

Convert Microsoft Office and OpenDocument formats to PDF:

| Format | Extensions |
|--------|------------|
| Microsoft Word | `.doc`, `.docx` |
| Microsoft Excel | `.xls`, `.xlsx` |
| Microsoft PowerPoint | `.ppt`, `.pptx` |
| OpenDocument | `.odt`, `.ods`, `.odp` |
| Rich Text Format | `.rtf` |
| CSV | `.csv` |

#### Office/URL Conversion Example

```typescript
import { DeepCitation, wrapCitationPrompt } from "@deepcitation/deepcitation-js";

const dc = new DeepCitation({ apiKey: process.env.DEEPCITATION_API_KEY });

// Convert a URL to PDF
const urlResult = await dc.convertToPdf("https://example.com/article");

// Or convert an Office document
const docResult = await dc.convertToPdf({
  file: docxBuffer,
  filename: "report.docx",
});

// Then prepare the converted file for citation verification
const { fileDeepText, fileId } = await dc.prepareConvertedFile({
  fileId: urlResult.fileId,
});

// Use fileDeepText in your LLM prompt via wrapCitationPrompt
const { enhancedSystemPrompt, enhancedUserPrompt } = wrapCitationPrompt({
  systemPrompt: "You are a helpful assistant...",
  userPrompt: userMessage,
  fileDeepText, // Automatically wrapped in <file_text> tags
});

// After LLM response, verify citations
const verified = await dc.verifyCitations(fileId, citations);
```

---

## Contributing

We welcome contributions! Here's how to get started:

### Setting Up Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/deepcitation-js.git
cd deepcitation-js

# Install dependencies
bun install

# Build the package
bun run build

# Run tests
bun run test
```

### Making Changes

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure tests pass:
   ```bash
   bun run test
   bun run lint
   ```

3. Commit with a descriptive message:
   ```bash
   git commit -m "feat: add new citation format support"
   ```

4. Push and open a Pull Request against `main`.

### Pull Request Guidelines

- Keep PRs focused on a single change
- Include tests for new functionality
- Update documentation as needed
- Follow the existing code style
- Ensure all CI checks pass

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions or fixes
- `chore:` - Maintenance tasks

---

## Reporting Issues

Found a bug or have a feature request? [Open an issue on GitHub](https://github.com/deepcitation/deepcitation-js/issues/new).

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear explanation of the issue
- **Reproduction steps**: Minimal code to reproduce the problem
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: Node.js version, package version, OS

Example:
```markdown
**Description**
Citations with special characters are not parsed correctly.

**Reproduction**
const result = getAllCitationsFromLlmOutput('<cite page="1">Test & Co.</cite>');
// Returns empty object instead of parsed citation

**Expected**: Citation with value "Test & Co." parsed
**Actual**: Empty object returned

**Environment**: Node.js 20.x, @deepcitation/deepcitation-js v1.0.0, macOS 14
```

### Feature Requests

For feature requests, please describe:

- **Use case**: What problem are you trying to solve?
- **Proposed solution**: How would you like it to work?
- **Alternatives considered**: Other approaches you've thought of

---

## License

MIT

## Links

- [Documentation](https://deepcitation.com/docs)
- [Get Free API Key](https://deepcitation.com/signup)
- [GitHub](https://github.com/deepcitation/deepcitation)
