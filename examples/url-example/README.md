# DeepCitation URL Example

An interactive TUI (Text User Interface) that demonstrates citation verification from web URLs using DeepCitation.

## What it does

1. Prompts you to enter a URL
2. Converts the URL to PDF and extracts text content (async)
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

Converting URL to PDF...
  Converted: typescript-wikipedia.pdf
  Time: 1234ms

Extracting text content...
  Pages: 5
  Text size: 45KB
  Attachment ID: abc123xyz...

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

The example uses the DeepCitation two-step URL processing flow:

```typescript
// Step 1: Convert URL to PDF
const convertResult = await deepcitation.convertToPdf({ url });
const attachmentId = convertResult.attachmentId;

// Step 2: Extract text from the converted PDF
const prepareResult = await deepcitation.prepareConvertedFile({ attachmentId });
const deepTextPromptPortion = prepareResult.deepTextPromptPortion;

// Step 3: Use deepTextPromptPortion in LLM prompts
const { enhancedSystemPrompt, enhancedUserPrompt } = wrapCitationPrompt({
  systemPrompt,
  userPrompt: question,
  deepTextPromptPortion,
});

// Step 4: Call LLM and verify citations
const parsedCitations = getAllCitationsFromLlmOutput(llmResponse);
const verified = await deepcitation.verifyAttachment(attachmentId, parsedCitations);
```

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
