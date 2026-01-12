# Support Bot Example

A complete example of a customer support bot that verifies all AI responses against knowledge base documents—without showing citation markers to customers.

## Use Case

Customer-facing AI assistants need to be accurate, but visible citations like `[1]` or `<cite>` tags look robotic and confusing to end users. This example shows how to:

- **Verify internally**: All LLM responses are verified against source documents
- **Display cleanly**: Customers see natural responses without citation clutter
- **Monitor quality**: Track confidence scores for quality assurance
- **Flag for review**: Low-confidence responses are automatically flagged

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment file and add your API keys
cp .env.example .env

# Run the demo (no server)
bun run demo

# Or start the API server
bun start
```

## Demo Output

```
🤖 DeepCitation Support Bot Demo

📚 Loading knowledge base...
✅ Knowledge base loaded

────────────────────────────────────────────────────────────
❓ Customer: "What is your refund policy?"

💬 Bot: All purchases are eligible for a full refund within 30 days
of purchase. After 30 days, you may receive store credit for unused
products. Digital products are non-refundable after download or
activation. To request a refund, contact support@acme.com or call
1-800-ACME-HELP.

✅ Confidence: 100% (3/3 citations verified)

────────────────────────────────────────────────────────────
❓ Customer: "How much does express shipping cost?"

💬 Bot: Express shipping costs $12.99 and takes 2-3 business days.

✅ Confidence: 100% (2/2 citations verified)
```

## API Endpoints

### `POST /chat` - Customer-Facing

Returns a clean response without citations:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is your refund policy?"}'
```

Response:
```json
{
  "response": "All purchases are eligible for a full refund within 30 days...",
  "confidence": 0.95,
  "needsReview": false
}
```

### `POST /chat/detailed` - Admin/Debug

Returns full verification details:

```bash
curl -X POST http://localhost:3000/chat/detailed \
  -H "Content-Type: application/json" \
  -d '{"question": "What is your refund policy?"}'
```

Response:
```json
{
  "response": "All purchases are eligible for a full refund within 30 days...",
  "rawResponse": "All purchases are eligible for a full refund <cite.../>...",
  "confidence": 0.95,
  "needsReview": false,
  "citations": {
    "total": 3,
    "verified": 3,
    "details": {
      "1": {
        "searchState": { "status": "found" },
        "matchSnippet": "eligible for a full refund within 30 days",
        "pageNumber": 1
      }
    }
  }
}
```

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Customer  │────▶│  Support Bot │────▶│   OpenAI GPT-4  │
│   Question  │     │   Server     │     │                 │
└─────────────┘     └──────┬───────┘     └────────┬────────┘
                          │                       │
                          │ Verify                │ Response
                          ▼                       │ (with citations)
                   ┌──────────────┐               │
                   │ DeepCitation │◀──────────────┘
                   │     API      │
                   └──────┬───────┘
                          │
                          ▼
┌─────────────┐    ┌──────────────┐
│   Clean     │◀───│  Confidence  │
│  Response   │    │    Score     │
└─────────────┘    └──────────────┘
```

## Key Concepts

### Invisible Citations

The LLM generates responses with citation tags internally:

```
All purchases are eligible for a full refund <cite file_id='kb'
full_phrase='eligible for a full refund within 30 days' line_ids='4-5'/>.
```

But customers see a clean response:

```
All purchases are eligible for a full refund within 30 days.
```

### Confidence Scoring

```typescript
const confidence = verifiedCitations / totalCitations;

// 100% = All citations verified ✅
// 80%+ = Acceptable quality ✅
// <80% = Flag for review ⚠️
// 0%   = No verifiable claims ❌
```

### Quality Gates

Configure minimum confidence thresholds:

```typescript
const bot = new SupportBot({
  minConfidenceThreshold: 0.8, // 80% of citations must verify
});

const response = await bot.answer(question);

if (response.needsReview) {
  // Route to human agent
  // Log for quality monitoring
  // Trigger alert
}
```

## Loading Your Own Knowledge Base

```typescript
// Single document
await bot.loadKnowledgeBase(
  fs.readFileSync("./faq.pdf"),
  "faq.pdf"
);

// Multiple documents
await bot.loadMultipleDocuments([
  { content: fs.readFileSync("./faq.pdf"), filename: "faq.pdf" },
  { content: fs.readFileSync("./policies.pdf"), filename: "policies.pdf" },
  { content: fs.readFileSync("./manual.pdf"), filename: "manual.pdf" },
]);
```

## Production Considerations

1. **Cache knowledge base**: Upload documents once, reuse `fileDataParts`
2. **Monitor confidence**: Set up alerts for consistently low scores
3. **Human escalation**: Route low-confidence responses to human agents
4. **Audit logging**: Store verification details for compliance
5. **Rate limiting**: Implement rate limits for API endpoints

## Next Steps

- See the [basic-verification example](../basic-verification) for simpler usage
- Check out [React components](../../README.md#react-components) if you want to show citations
- Read the [full documentation](https://deepcitation.com/docs) for advanced patterns
