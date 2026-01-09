# Quick Start: shadcn-like Component System

This guide shows you how to implement the shadcn-style component architecture **today**, with quick wins you can ship this week.

## ✅ What You Already Have (Great!)

Your `primitives.tsx` is already shadcn-like! Users can compose citations:

```tsx
import { Citation } from '@deepcitation/deepcitation-js/react/primitives'

// Custom composition
<Citation.Root citation={citation} foundCitation={verification}>
  <Citation.Trigger>
    <Citation.Bracket>
      <Citation.Number />
      <Citation.Indicator />
    </Citation.Bracket>
  </Citation.Trigger>
</Citation.Root>
```

## 🚀 Phase 1: CSS Variables (2 hours)

### Step 1: Create theme CSS

Create `src/react/theme.css`:

```css
@layer base {
  :root {
    /* Citation colors - use HSL for easy theming */
    --citation-verified: 217 91% 60%;           /* Blue */
    --citation-verified-fg: 217 91% 20%;        /* Dark blue */
    --citation-miss: 0 84% 60%;                 /* Red */
    --citation-miss-fg: 0 84% 20%;              /* Dark red */
    --citation-partial: 38 92% 50%;             /* Yellow */
    --citation-partial-fg: 38 92% 20%;          /* Dark yellow */
    --citation-pending: 215 20% 65%;            /* Gray */
    --citation-pending-fg: 215 20% 20%;         /* Dark gray */

    /* Spacing */
    --citation-radius: 0.375rem;
    --citation-padding-x: 0.375rem;
    --citation-padding-y: 0.125rem;
    --citation-font-size: 0.875rem;

    /* Transitions */
    --citation-transition: all 150ms ease;
  }

  .dark {
    --citation-verified: 217 91% 70%;
    --citation-verified-fg: 217 91% 95%;
    --citation-miss: 0 84% 70%;
    --citation-miss-fg: 0 84% 95%;
    --citation-partial: 38 92% 60%;
    --citation-partial-fg: 38 92% 95%;
    --citation-pending: 215 20% 75%;
    --citation-pending-fg: 215 20% 95%;
  }
}

@layer components {
  .citation-root {
    display: inline-flex;
    align-items: center;
  }

  .citation-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    padding: var(--citation-padding-y) var(--citation-padding-x);
    border-radius: var(--citation-radius);
    font-size: var(--citation-font-size);
    transition: var(--citation-transition);
    cursor: pointer;
  }

  .citation-trigger--verified {
    background-color: hsl(var(--citation-verified) / 0.1);
    color: hsl(var(--citation-verified-fg));
  }

  .citation-trigger--verified:hover {
    background-color: hsl(var(--citation-verified) / 0.15);
  }

  .citation-trigger--miss {
    background-color: hsl(var(--citation-miss) / 0.1);
    color: hsl(var(--citation-miss-fg));
  }

  .citation-trigger--partial {
    background-color: hsl(var(--citation-partial) / 0.1);
    color: hsl(var(--citation-partial-fg));
  }

  .citation-trigger--pending {
    background-color: hsl(var(--citation-pending) / 0.1);
    color: hsl(var(--citation-pending-fg));
  }
}
```

### Step 2: Update package.json exports

```json
{
  "exports": {
    "./react": {
      "types": "./lib/react/index.d.ts",
      "import": "./lib/react/index.js"
    },
    "./react/primitives": {
      "types": "./lib/react/primitives.d.ts",
      "import": "./lib/react/primitives.js"
    },
    "./react/styles.css": "./src/react/styles.css",
    "./react/theme.css": "./src/react/theme.css"
  }
}
```

### Step 3: Update documentation

```tsx
// Users can now customize easily!
import '@deepcitation/deepcitation-js/react/theme.css'

// In their own CSS:
:root {
  --citation-verified: 120 100% 50%;  /* Change to green */
}
```

**Result:** Users can theme citations without touching JavaScript! ✅

---

## 🎨 Phase 2: Pre-built Compositions (1 day)

Create `src/react/presets/` directory:

### Preset 1: Brackets (Default)

```tsx
// src/react/presets/citation-brackets.tsx
'use client'  // Next.js compatibility

import { Citation, type CitationRootProps } from '../primitives.js'
import { Check, AlertCircle, X } from '../icons.js'  // Or lucide-react
import '../theme.css'

export interface CitationBracketsProps extends Omit<CitationRootProps, 'children'> {
  onCitationClick?: (citation: CitationType, key: string) => void
  showIndicator?: boolean
}

/**
 * Citation with brackets - [1✓]
 *
 * The classic citation style with verification indicator.
 *
 * @example
 * ```tsx
 * <CitationBrackets
 *   citation={citation}
 *   foundCitation={verification}
 *   onCitationClick={(c) => console.log('Clicked', c)}
 * />
 * ```
 */
export function CitationBrackets({
  citation,
  foundCitation,
  onCitationClick,
  showIndicator = true,
  ...props
}: CitationBracketsProps) {
  return (
    <Citation.Root citation={citation} foundCitation={foundCitation} {...props}>
      <Citation.Trigger onCitationClick={onCitationClick}>
        <Citation.Bracket open="[" close="]">
          <Citation.Number />
          {showIndicator && (
            <Citation.Indicator
              verifiedIndicator={<Check />}
              partialIndicator={<AlertCircle />}
              missIndicator={<X />}
            />
          )}
        </Citation.Bracket>
      </Citation.Trigger>
    </Citation.Root>
  )
}
```

### Preset 2: Inline Citation

```tsx
// src/react/presets/citation-inline.tsx
export function CitationInline({ citation, foundCitation }: CitationProps) {
  return (
    <Citation.Root citation={citation} foundCitation={foundCitation}>
      <Citation.Trigger className="citation-inline">
        <Citation.Value />
        <Citation.Indicator
          className="citation-inline__indicator"
          verifiedIndicator="✓"
          showFor={['verified', 'partial']}
        />
      </Citation.Trigger>
    </Citation.Root>
  )
}

// Usage: Revenue grew by 25%✓
```

### Preset 3: Minimal

```tsx
// src/react/presets/citation-minimal.tsx
export function CitationMinimal({ citation, foundCitation }: CitationProps) {
  return (
    <Citation.Root citation={citation} foundCitation={foundCitation}>
      <Citation.Trigger>
        <Citation.Number />
        <Citation.Indicator verifiedIndicator="✓" />
      </Citation.Trigger>
    </Citation.Root>
  )
}

// Usage: 1✓
```

### Export all presets

```tsx
// src/react/presets/index.ts
export { CitationBrackets } from './citation-brackets.js'
export { CitationInline } from './citation-inline.js'
export { CitationMinimal } from './citation-minimal.js'
```

Update package.json:
```json
{
  "exports": {
    "./react/presets": {
      "types": "./lib/react/presets/index.d.ts",
      "import": "./lib/react/presets/index.js"
    }
  }
}
```

**Result:** Users get pre-built components they can use OR copy-paste! ✅

---

## 📚 Phase 3: Documentation Examples (4 hours)

### Add to your docs site

#### Example 1: Component Preview

```tsx
// docs/components/citation-examples.tsx
import { CitationBrackets, CitationInline, CitationMinimal } from '@deepcitation/deepcitation-js/react/presets'

export function ComponentExamples() {
  const mockCitation = {
    citationNumber: 1,
    fullPhrase: "Revenue increased by 25% year-over-year",
    pageNumber: 12,
    lineId: "5"
  }

  const mockVerification = {
    searchState: { status: 'found' }
  }

  return (
    <div className="space-y-8">
      <section>
        <h3>Brackets (Default)</h3>
        <p>
          The company saw strong growth <CitationBrackets
            citation={mockCitation}
            foundCitation={mockVerification}
          /> in Q4.
        </p>
        <CodeBlock language="tsx">
{`<CitationBrackets
  citation={citation}
  foundCitation={verification}
/>`}
        </CodeBlock>
      </section>

      <section>
        <h3>Inline</h3>
        <p>
          Revenue grew by <CitationInline
            citation={{ ...mockCitation, value: "25%" }}
            foundCitation={mockVerification}
          /> year-over-year.
        </p>
      </section>

      <section>
        <h3>Minimal</h3>
        <p>
          Strong performance in Q4 <CitationMinimal
            citation={mockCitation}
            foundCitation={mockVerification}
          />.
        </p>
      </section>
    </div>
  )
}
```

#### Example 2: Customization Guide

Add to README or docs:

```markdown
## Customization

### Using Presets

Quick start with pre-built components:

\`\`\`tsx
import { CitationBrackets } from '@deepcitation/deepcitation-js/react/presets'
import '@deepcitation/deepcitation-js/react/theme.css'

<CitationBrackets citation={citation} foundCitation={verification} />
\`\`\`

### Custom Theming

Override CSS variables:

\`\`\`css
:root {
  --citation-verified: 120 100% 40%;  /* Green instead of blue */
  --citation-radius: 0.5rem;          /* More rounded */
}
\`\`\`

### Build Your Own

Use primitives for full control:

\`\`\`tsx
import { Citation } from '@deepcitation/deepcitation-js/react/primitives'

export function MyCustomCitation({ citation, verification }) {
  return (
    <Citation.Root citation={citation} foundCitation={verification}>
      <Citation.Trigger className="my-custom-class">
        <span className="font-bold">Ref {citation.citationNumber}</span>
        <Citation.Status>
          {(status) => status.isVerified ? '✓' : '✗'}
        </Citation.Status>
      </Citation.Trigger>
    </Citation.Root>
  )
}
\`\`\`

### Copy-Paste Components

Don't like npm updates? Copy the source:

1. Copy `citation-brackets.tsx` from [GitHub](link)
2. Paste into `components/ui/citation.tsx`
3. Modify freely!

Now you own the code. No version conflicts, full control.
```

**Result:** Users understand ALL their options! ✅

---

## 🔧 Phase 4: Quick Utility Additions (2 hours)

### Add cn utility (like shadcn)

```tsx
// src/react/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine class names with Tailwind merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Add dependencies:
```bash
npm install clsx tailwind-merge
```

Export in `utils.ts`:
```tsx
export { cn } from './cn.js'
```

### Add mock data helpers

```tsx
// src/react/test-utils.ts
import type { Citation, FoundHighlightLocation } from '../types/citation.js'

/**
 * Create a mock citation for testing/demos
 */
export function createMockCitation(overrides?: Partial<Citation>): Citation {
  return {
    citationNumber: 1,
    fullPhrase: "Test citation phrase from the source document",
    pageNumber: 1,
    lineId: "5",
    value: undefined,
    reasoning: undefined,
    ...overrides
  }
}

/**
 * Create a mock verification result
 */
export function createMockVerification(
  status: 'found' | 'not_found' | 'partial_text_found' = 'found',
  overrides?: Partial<FoundHighlightLocation>
): FoundHighlightLocation {
  return {
    searchState: { status },
    matchSnippet: "Test citation phrase",
    pageNumber: 1,
    ...overrides
  }
}

// Usage in docs/examples:
const citation = createMockCitation({ citationNumber: 5 })
const verification = createMockVerification('found')
```

**Result:** Easier to write examples and tests! ✅

---

## 📦 Phase 5: Package Exports Structure

Update package.json with clean exports:

```json
{
  "name": "@deepcitation/deepcitation-js",
  "exports": {
    ".": {
      "types": "./lib/index.d.ts",
      "import": "./lib/index.js"
    },
    "./react": {
      "types": "./lib/react/index.d.ts",
      "import": "./lib/react/index.js"
    },
    "./react/primitives": {
      "types": "./lib/react/primitives.d.ts",
      "import": "./lib/react/primitives.js"
    },
    "./react/presets": {
      "types": "./lib/react/presets/index.d.ts",
      "import": "./lib/react/presets/index.js"
    },
    "./react/hooks": {
      "types": "./lib/react/hooks.d.ts",
      "import": "./lib/react/hooks.js"
    },
    "./react/utils": {
      "types": "./lib/react/utils.d.ts",
      "import": "./lib/react/utils.js"
    },
    "./react/styles.css": "./src/react/styles.css",
    "./react/theme.css": "./src/react/theme.css"
  }
}
```

**Users import like this:**
```tsx
// Core functionality
import { DeepCitation } from '@deepcitation/deepcitation-js'

// Primitives (for custom compositions)
import { Citation } from '@deepcitation/deepcitation-js/react/primitives'

// Presets (ready to use)
import { CitationBrackets } from '@deepcitation/deepcitation-js/react/presets'

// Utilities
import { cn, createMockCitation } from '@deepcitation/deepcitation-js/react/utils'

// Styles
import '@deepcitation/deepcitation-js/react/theme.css'
```

Clean and organized! ✅

---

## 🎯 Week 1 Checklist

- [ ] Create `src/react/theme.css` with CSS variables
- [ ] Move inline styles to use CSS variables
- [ ] Create `src/react/presets/` directory
- [ ] Build 3 preset components (brackets, inline, minimal)
- [ ] Add `cn` utility
- [ ] Add `createMockCitation` test helpers
- [ ] Update package.json exports
- [ ] Write "Customization" documentation section
- [ ] Add copy-paste instructions to docs
- [ ] Ship it! 🚀

---

## 📈 Success Metrics

Track these to see if it's working:

1. **GitHub Discussions**: Users asking "How do I customize X?"
2. **npm Downloads**: Increase in `react/primitives` imports
3. **Stars/Forks**: More engagement
4. **Blog Posts**: Users writing about customization
5. **Discord Activity**: Users sharing custom components

---

## 💡 Next Steps After Week 1

Once Phase 1 is solid:

1. **Add Tailwind preset** - Most popular styling approach
2. **Create component playground** - Interactive docs
3. **Build CLI tool** - `npx deepcitation-ui add citation`
4. **Record video tutorial** - "Build your own citation component"
5. **Launch blog post** - "We're going shadcn-style!"

---

## 🤝 Need Help?

- shadcn's source code: https://github.com/shadcn-ui/ui
- Radix UI docs: https://www.radix-ui.com/primitives
- Feel free to reach out!

Good luck! 🎉
