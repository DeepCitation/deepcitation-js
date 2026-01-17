# CLAUDE.md - DeepCitation Package

This file provides guidance to Claude Code when working with the DeepCitation npm package.

## Package Overview

DeepCitation is a citation verification and parsing library that enables AI-generated content to include verifiable references. It provides citation extraction, normalization, verification against source documents, and visual proof generation.

## NPM Package

- **Package Name**: `@deepcitation/deepcitation-js`
- **Registry**: npm public registry
- **Version Strategy**: Semantic versioning
- **License**: MIT
- **Repository**: https://github.com/deepcitation/deepcitation-js

### Installation
```bash
npm install @deepcitation/deepcitation-js
# or
yarn add @deepcitation/deepcitation-js
# or
bun add @deepcitation/deepcitation-js
```

## Key Exports

### Core Functions (from main entry)
```typescript
import {
  wrapSystemCitationPrompt,      // Wrap LLM system prompts with citation instructions
  wrapCitationPrompt,            // Wrap both system and user prompts
  CITATION_JSON_OUTPUT_FORMAT,   // JSON schema for structured output LLMs
  CITATION_REMINDER,             // Short reminder for reinforcement in user prompts
  getAllCitationsFromLlmOutput,  // Extract citations from LLM response text
} from "@deepcitation/deepcitation-js";

import type { CitationPosition } from "@deepcitation/deepcitation-js";
```

### React Components (from /react)
```typescript
import {
  CitationComponent,
  SourcesListComponent,
  SourcesTrigger,
  SourcesListItem,
} from "@deepcitation/deepcitation-js/react";
```

### Types
```typescript
import type { Citation, Verification } from "@deepcitation/deepcitation-js";
```

## Integration Workflow

### 1. Upload Source Files
```bash
curl -X POST https://api.deepcitation.com/prepareFile \
  -H "Authorization: Bearer $DEEPCITATION_API_KEY" \
  -F "file=@document.pdf"
```
Returns: `attachmentId`, `promptContent` with page/line IDs.

### 2. Wrap System Prompt
```typescript
import { wrapSystemCitationPrompt } from "@deepcitation/deepcitation-js";

const systemPrompt = `You are a helpful assistant...`;

// Default (append) - instructions at end of system prompt
const enhanced = wrapSystemCitationPrompt({ systemPrompt });

// Prepend - recommended for large system prompts (highest priority)
const enhanced = wrapSystemCitationPrompt({ systemPrompt, position: 'prepend' });

// Wrap - maximum emphasis (instructions at start AND reminder at end)
const enhanced = wrapSystemCitationPrompt({ systemPrompt, position: 'wrap' });
```

#### Position Options

| Position   | Description                                      | Best For                        |
|------------|--------------------------------------------------|---------------------------------|
| `'append'` | Instructions at end (default)                    | Short system prompts            |
| `'prepend'`| Instructions at start                            | Large system prompts            |
| `'wrap'`   | Full instructions at start + reminder at end     | Maximum reliability             |

#### Citation Reminders

For additional reinforcement, you can add reminders to user prompts:

```typescript
import { wrapCitationPrompt, CITATION_REMINDER } from "@deepcitation/deepcitation-js";

// Using wrapCitationPrompt with addUserReminder
const { enhancedSystemPrompt, enhancedUserPrompt } = wrapCitationPrompt({
  systemPrompt,
  userPrompt,
  position: 'prepend',           // Instructions at start of system prompt
  addUserReminder: true,         // Add reminder to end of user prompt
});

// Or manually add CITATION_REMINDER where needed
const userPromptWithReminder = `${userPrompt}\n\n${CITATION_REMINDER}`;
```

For structured JSON output:
```typescript
import { CITATION_JSON_OUTPUT_FORMAT } from "@deepcitation/deepcitation-js";

const responseFormat = {
  type: "json_schema",
  json_schema: {
    schema: {
      properties: {
        citation: CITATION_JSON_OUTPUT_FORMAT,
      }
    }
  }
};
```

### 3. Extract & Verify Citations
```typescript
import { getAllCitationsFromLlmOutput } from "@deepcitation/deepcitation-js";

const citations = getAllCitationsFromLlmOutput(llmResponse);
// Returns: { "1": { pageNumber: 1, lineId: "1", fullPhrase: "..." }, ... }
```

```bash
curl -X POST https://api.deepcitation.com/verifyCitations \
  -H "Authorization: Bearer $DEEPCITATION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "attachmentId": "...",
      "citations": { ... },
      "outputImageFormat": "avif"
    }
  }'
```

### 4. Display Results

The CitationComponent uses two orthogonal props:

- **`variant`**: Visual style (how it looks)
- **`content`**: What text to display

```tsx
import { CitationComponent } from "@deepcitation/deepcitation-js/react";

// Default: brackets variant with number content → [1✓]
<CitationComponent citation={citation} verification={verification} />

// Chip with keySpan (the default content for chip) → pill badge with "Revenue Growth✓"
<CitationComponent citation={citation} verification={verification} variant="chip" />

// Chip with number → pill badge with "1✓"
<CitationComponent citation={citation} verification={verification} variant="chip" content="number" />

// Brackets with keySpan → [Revenue Growth✓]
<CitationComponent citation={citation} verification={verification} variant="brackets" content="keySpan" />

// Superscript footnote style → ¹✓
<CitationComponent citation={citation} verification={verification} variant="superscript" />

// Just the indicator → ✓
<CitationComponent citation={citation} verification={verification} content="indicator" />
```

#### Variant (Visual Style)

| Variant       | Output Example          | Description                                    |
|---------------|-------------------------|------------------------------------------------|
| `"brackets"`  | `[1✓]`                  | Square brackets, monospace (default)           |
| `"chip"`      | `Revenue Growth✓`       | Pill/badge with background color               |
| `"text"`      | `Revenue Growth✓`       | Plain text, inherits parent styling            |
| `"superscript"` | `¹✓`                  | Small raised footnote style                    |
| `"minimal"`   | `1✓`                    | Compact text with truncation                   |

#### Content (What's Displayed)

| Content       | Output Example     | Description                                    |
|---------------|--------------------|------------------------------------------------|
| `"keySpan"`   | `Revenue Growth`   | Descriptive text from citation                 |
| `"number"`    | `1`                | Citation number (defaults to "1" if missing)   |
| `"indicator"` | `✓`                | Only the status icon, no text                  |

**Default content per variant:**
- `chip` → `keySpan`
- `brackets` → `number`
- `text` → `keySpan`
- `superscript` → `number`
- `minimal` → `number`

### 5. Status Indicators

The component displays different indicators based on `verification.status`:

| Status        | Indicator          | Color  | `status` values                              |
|---------------|--------------------| -------|----------------------------------------------|
| **Pending**   | Spinner ◌          | Gray   | `"pending"`, `"loading"`, or `null`/`undefined`          |
| **Verified**  | Checkmark ✓        | Green  | `"found"`, `"found_key_span_only"`, `"found_phrase_missed_value"` |
| **Partial**   | Checkmark ✓        | Amber  | `"found_on_other_page"`, `"found_on_other_line"`, `"partial_text_found"`, `"first_word_found"` |
| **Not Found** | Warning △          | Red    | `"not_found"`                                            |

```tsx
// Pending state (spinner)
<CitationComponent citation={citation} verification={null} />
<CitationComponent citation={citation} verification={{ status: "pending" }} />

// Verified state (green check)
<CitationComponent citation={citation} verification={{ status: "found" }} />

// Partial match (amber check)
<CitationComponent citation={citation} verification={{ status: "found_on_other_page" }} />

// Not found (red warning)
<CitationComponent citation={citation} verification={{ status: "not_found" }} />
```

#### Custom Indicator Rendering

```tsx
// Custom indicator rendering
<CitationComponent
  citation={citation}
  verification={verification}
  renderIndicator={(status) => status.isVerified ? <MyCheckIcon /> : null}
/>
```

### 6. Interaction Behavior

The CitationComponent has simple, predictable default behaviors:
- **Hover**: Shows popover with verification image/details
- **Click**: Opens full-size image overlay (zooms the image)
- **Escape / Click overlay**: Closes the image overlay

The popover uses a portal to render at the document body level, so it won't be clipped by parent `overflow:hidden` containers.

### 7. Styling

The component uses **Tailwind CSS** classes. Make sure your project has Tailwind configured. The component is designed to be copy/paste friendly - you can copy the component source into your project and customize as needed.

### 8. Customizing Click/Hover Behavior

**Key principle**: When you provide `onClick` in `eventHandlers` OR `behaviorConfig`, the default click behavior is disabled. Use `behaviorConfig.onClick` to implement custom click actions.

```tsx
import { CitationComponent } from "@deepcitation/deepcitation-js/react";

// Custom click behavior (replaces default)
<CitationComponent
  citation={citation}
  verification={verification}
  behaviorConfig={{
    onClick: (context, event) => {
      // Your custom action
      console.log('Clicked:', context.citationKey);
      // Return actions to control state
      return { setImageExpanded: true };
    }
  }}
/>

// Disable all click behavior
<CitationComponent
  citation={citation}
  verification={verification}
  behaviorConfig={{ onClick: () => false }}
/>

// Custom hover callbacks (run alongside default hover behavior)
<CitationComponent
  citation={citation}
  verification={verification}
  behaviorConfig={{
    onHover: {
      onEnter: (context) => console.log('Hovering:', context.citationKey),
      onLeave: (context) => console.log('Left:', context.citationKey),
    }
  }}
/>
```

#### Behavior Types

```typescript
// Context provided to behavior handlers
interface CitationBehaviorContext {
  citation: Citation;
  citationKey: string;
  verification: Verification | null;
  isTooltipExpanded: boolean;  // Is popover currently showing (hover)?
  isImageExpanded: boolean;    // Is full-size image showing?
  hasImage: boolean;           // Is verification image available?
}

// Actions you can return from onClick
interface CitationBehaviorActions {
  setImageExpanded?: boolean | string; // Open/close image (or provide src)
}

// Config interface
interface CitationBehaviorConfig {
  onClick?: (context, event) => CitationBehaviorActions | false | void;
  onHover?: {
    onEnter?: (context) => void;
    onLeave?: (context) => void;
  };
}
```

### 9. Aggregated Sources List (Anthropic-style)

The `SourcesListComponent` displays citations in an aggregated list format, similar to Claude's "Sources" panel. This is useful for collecting all sources at the end of AI-generated content.

```tsx
import {
  SourcesListComponent,
  SourcesTrigger,
  useSourcesList,
} from "@deepcitation/deepcitation-js/react";

// Basic usage with drawer (mobile-friendly)
const { sources, isOpen, setIsOpen } = useSourcesList([
  { id: "1", url: "https://twitch.tv/theo", title: "Theo - Twitch", domain: "twitch.tv" },
  { id: "2", url: "https://linkedin.com/in/john", title: "John Doe - LinkedIn", domain: "linkedin.com" },
]);

// Trigger button (shows stacked favicons)
<SourcesTrigger
  sources={sources}
  onClick={() => setIsOpen(true)}
  label="Sources"
/>

// Sources list drawer
<SourcesListComponent
  sources={sources}
  variant="drawer"
  isOpen={isOpen}
  onOpenChange={setIsOpen}
/>
```

#### Variant (Display Mode)

| Variant   | Description                                        |
|-----------|----------------------------------------------------|
| `"drawer"`| Bottom sheet modal (mobile-friendly, default)      |
| `"modal"` | Centered modal overlay                             |
| `"panel"` | Collapsible panel inline with content              |
| `"inline"`| Inline list without modal/container styling        |

#### Source Item Props

Each source in the list has these properties:

```typescript
interface SourcesListItemProps {
  id: string;           // Unique identifier
  url: string;          // Source URL
  title: string;        // Page/document title
  domain: string;       // Display domain (e.g., "Twitch", "LinkedIn")
  sourceType?: SourceType;     // Platform type for icon selection
  faviconUrl?: string;         // Custom favicon URL
  citationNumbers?: number[];  // Which citations reference this source
  verificationStatus?: "verified" | "partial" | "pending" | "failed" | "unknown";
}
```

#### Source Types

The `sourceType` field categorizes sources for display:

| Type        | Examples                                           |
|-------------|----------------------------------------------------|
| `"web"`     | Generic web pages                                  |
| `"social"`  | Twitter/X, Facebook, LinkedIn, Instagram           |
| `"video"`   | YouTube, Twitch, Vimeo, TikTok                     |
| `"news"`    | Reuters, BBC, CNN, NYTimes                         |
| `"code"`    | GitHub, GitLab, Stack Overflow                     |
| `"academic"`| arXiv, PubMed, Google Scholar                      |
| `"forum"`   | Reddit, Quora, Discourse                           |
| `"reference"`| Wikipedia, Britannica                             |
| `"pdf"`     | PDF documents                                      |
| `"document"`| Uploaded documents                                 |

#### Converting Citations to Sources

```typescript
import { sourceCitationsToListItems } from "@deepcitation/deepcitation-js/react";
import type { SourceCitation } from "@deepcitation/deepcitation-js";

// Convert array of SourceCitation to SourcesListItemProps
const citations: SourceCitation[] = [
  { url: "https://example.com/article", title: "Example Article", citationNumber: 1 },
  { url: "https://example.com/article", title: "Example Article", citationNumber: 2 }, // Same URL
];

const sources = sourceCitationsToListItems(citations);
// Results in single item with citationNumbers: [1, 2]
```

#### Customization

```tsx
// Custom header
<SourcesListComponent
  sources={sources}
  header={{
    title: "References",
    showCount: true,
    showCloseButton: true,
  }}
/>

// Group by domain
<SourcesListComponent
  sources={sources}
  groupByDomain={true}
/>

// Show verification badges
<SourcesListComponent
  sources={sources}
  showVerificationIndicators={true}
  showCitationBadges={true}
/>

// Custom item click handler
<SourcesListComponent
  sources={sources}
  onSourceClick={(source, event) => {
    console.log('Clicked:', source.title);
    // Default: opens URL in new tab
  }}
/>

// Custom item rendering
<SourcesListComponent
  sources={sources}
  renderItem={(source, index) => (
    <MyCustomSourceItem key={source.id} source={source} />
  )}
/>
```

#### SourceCitation Type

For web search / URL-based citations, use the extended `SourceCitation` type:

```typescript
import type { SourceCitation, SourceMeta } from "@deepcitation/deepcitation-js";

const citation: SourceCitation = {
  // Base Citation fields
  fullPhrase: "The revenue grew by 15%",
  keySpan: "revenue growth",
  citationNumber: 1,
  // Extended source fields
  url: "https://example.com/report",
  title: "Q4 Financial Report",
  domain: "example.com",
  context: "According to the latest financial report...",
  citedText: "revenue grew by 15%",
  sourceType: "news",
  faviconUrl: "https://example.com/favicon.ico",
  accessedAt: new Date(),
};
```

## API Endpoints

- `POST https://api.deepcitation.com/prepareFile` - Upload and process source documents
- `POST https://api.deepcitation.com/verifyCitations` - Verify citations against source


## Package Structure

```
src/
├── index.ts              # Main exports
├── client/               # DeepCitation client
├── parsing/              # Citation parsing & normalization
│   ├── parseCitation.ts
│   ├── normalizeCitation.ts
│   └── parseWorkAround.ts
├── prompts/              # LLM prompt utilities
│   ├── citationPrompts.ts
│   └── promptCompression.ts
├── react/                # React components
│   ├── index.ts
│   ├── CitationComponent.tsx
│   ├── CitationVariants.tsx
│   ├── UrlCitationComponent.tsx
│   └── SourcesListComponent.tsx  # Anthropic-style sources list
├── types/                # TypeScript types
│   ├── citation.ts
│   ├── verification.ts
│   ├── boxes.ts
│   └── search.ts
└── utils/                # Utilities
    └── sha.ts
```

## Example App Models

The Next.js example uses these models (DO NOT CHANGE):
- **OpenAI**: `gpt-5-mini`
- **Google**: `gemini-2.0-flash-lite`

## Common Issues & Solutions

### API Key Issues
- Store in environment variables (`DEEPCITATION_API_KEY`)
- Never commit to version control
- Rotate keys regularly

### File Upload Limits
- Check file size before upload
- Implement chunked upload for large files
- Handle timeout errors gracefully

### Citation Parsing
- Normalize citation formats
- Handle multiple citation styles
- Preserve original formatting
