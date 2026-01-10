# /cite - DeepCitation Verified Answers

Answer questions about documents with verifiable citations using DeepCitation.

## Usage

```
/cite <file_path> <question>
```

**Arguments:**
- `file_path`: Path to a PDF, image, or document file to analyze
- `question`: The question to answer using the document

**Examples:**
```
/cite ./report.pdf What were the key findings?
/cite ~/documents/contract.pdf What are the payment terms?
/cite ./data.csv What is the total revenue?
```

## Workflow

When the user invokes `/cite`, follow these steps:

### Step 1: Validate Input

Check that the file exists and is a supported format (PDF, PNG, JPG, DOCX, XLSX, etc.).

### Step 2: Prepare the File with DeepCitation API

Upload and prepare the file to get structured text with page/line metadata:

```bash
# Upload and prepare the file
curl -X POST "https://api.deepcitation.com/prepareFile" \
  -H "Authorization: Bearer $DEEPCITATION_API_KEY" \
  -F "file=@<file_path>" \
  -o /tmp/deepcitation_prepared.json
```

The response contains:
- `fileId`: Unique identifier for the uploaded file
- `promptContent`: Formatted text with `<line id="...">` markers for citation tracking

### Step 3: Generate Answer with Citations

Use the DeepCitation prompt wrapper to generate an answer. The system prompt must include citation instructions.

**Citation Format (XML in markdown):**
```xml
<cite
  file_id='FILE_ID'
  start_page_key='page_number_X_index_Y'
  full_phrase='exact verbatim quote from source'
  key_span='most important words'
  line_ids='1-3'
  reasoning='why this supports the claim'
/>
```

**Important:** When streaming the response, parse out the `<cite ... />` tags so the user sees clean text during generation. Store the citations for verification after generation completes.

### Step 4: Verify Citations

After the response is complete, verify all citations against the source:

```bash
curl -X POST "https://api.deepcitation.com/verifyCitations" \
  -H "Authorization: Bearer $DEEPCITATION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "fileId": "<file_id>",
      "citations": { ... },
      "outputImageFormat": "avif"
    }
  }'
```

### Step 5: Display Results with Citation Status

Replace the citation placeholders with verification status indicators:

**Status Indicators:**
- `[1✓]` - Verified: Citation found exactly in source (green)
- `[1⚠]` - Partial: Citation found but text differs slightly (yellow)
- `[1✗]` - Not Found: Citation could not be verified (red)
- `[1…]` - Pending: Verification in progress (gray)

**Example Output:**
```
The report indicates revenue grew by 25% [1✓] year-over-year,
driven primarily by new customer acquisition [2✓]. However,
operating costs also increased significantly [3⚠].

---
Citations: 3 total (2 verified, 1 partial)

1. ✓ Verified (p. 5): "Revenue increased 25% compared to the prior year"
2. ✓ Verified (p. 12): "New customer acquisition was the primary growth driver"
3. ⚠ Partial (p. 8): Expected "costs increased significantly" but found "costs rose materially"
```

## Streaming Output Format

During generation, strip cite tags to show clean text:

**Raw LLM output (hidden from user):**
```
The company reported strong growth <cite file_id='abc' ... /> in Q4.
```

**Displayed during streaming:**
```
The company reported strong growth in Q4.
```

**Final output after verification:**
```
The company reported strong growth [1✓] in Q4.

---
Citations: 1 total (1 verified)
```

## Environment Variables

- `DEEPCITATION_API_KEY`: Required. Your DeepCitation API key.

## Error Handling

- If the file doesn't exist, inform the user and suggest checking the path
- If the API key is missing, instruct the user to set `DEEPCITATION_API_KEY`
- If verification fails, still show the answer but mark citations as unverified
- If the file format is unsupported, list supported formats

## Supported File Formats

- **Documents:** PDF, DOCX, XLSX, PPTX, ODT, ODS, ODP, RTF, CSV
- **Images:** PNG, JPG, JPEG, GIF, WEBP, AVIF
- **Audio/Video:** MP3, WAV, MP4, WEBM (transcription-based citations)
