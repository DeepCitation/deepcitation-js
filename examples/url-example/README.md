# DeepCitation URL Example

An interactive TUI (Text User Interface) that demonstrates citation verification from web URLs using DeepCitation.

## What it does

1. Prompts you to enter a URL
2. Prepares the URL for citation verification (~30s for URLs vs <1s for PDFs/images)
3. Prompts you for a question about the content
4. Gets an answer from OpenAI with embedded citations
5. Verifies each citation against the source and displays results

## Setup

1. Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Run the example:

```bash
bun run start
# or
npm run start
```

## Example Session

```
============================================================
  DeepCitation URL Example - Interactive TUI (gpt-5-mini)
============================================================

Enter a URL to analyze: https://en.wikipedia.org/wiki/TypeScript

Preparing URL for citation verification...
(URLs take ~30s to process vs. <1s for images/PDFs)
  Filename: typescript-wikipedia.pdf
  Pages: 5
  Text size: 45KB
  Processing time: 28.3s

Enter your question about this content: What year was TypeScript first released?

Querying gpt-5-mini...

Response:
--------------------------------------------------
TypeScript was first made public in October 2012 <cite attachment_id='abc123xyz' full_phrase='TypeScript was first made public in October 2012' key_span='October 2012' line_ids='42'/>
--------------------------------------------------

Verifying citations...

Found 1 citation(s). Verifying...

Verification Results:
============================================================

Citation [1]: ✅ found
--------------------------------------------------
  Claimed: "TypeScript was first made public in October 2012"
  Status: ✅ found
  Page: 1
  Found: "TypeScript was first made public in October 2012..."
  Proof image: Yes (23KB)

============================================================

Clean Response (with verification status):
--------------------------------------------------
TypeScript was first made public in October 2012 [1✅]
--------------------------------------------------

Summary:
  Total citations: 1
  Verified: 1 (100%)
  Partial: 0 (0%)
  Not found: 0
```

## How it works

The example uses DeepCitation's unified `prepareUrl` method:

```typescript
// Single call to prepare URL - handles conversion and text extraction
const { attachmentId, deepTextPromptPortion } = await deepcitation.prepareUrl({
  url: "https://example.com/article"
});

// Use deepTextPromptPortion in LLM prompts
const { enhancedSystemPrompt, enhancedUserPrompt } = wrapCitationPrompt({
  systemPrompt,
  userPrompt: question,
  deepTextPromptPortion,
});

// Call LLM and verify citations
const parsedCitations = getAllCitationsFromLlmOutput(llmResponse);
const verified = await deepcitation.verifyAttachment(attachmentId, parsedCitations);
```

## Processing Times

| Source Type | Processing Time |
|-------------|-----------------|
| Images (PNG, JPEG, etc.) | <1 second |
| PDF documents | <1 second |
| URLs (web pages) | ~30 seconds |
| Office files (DOCX, XLSX, etc.) | ~30 seconds |

## Supported URL types

- Web pages (HTML)
- PDF documents (direct links)
- Most publicly accessible URLs

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPCITATION_API_KEY` | Yes | Your DeepCitation API key |
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `SYSTEM_PROMPT` | No | Override the default system prompt |
