# Component Architecture Guide - shadcn-like Citation Components

This guide outlines the strategy for maintaining DeepCitation's React components as a shadcn-style library for optimal developer experience.

## 🎯 Current State Analysis

**You're already 70% there!** Your `primitives.tsx` already follows the shadcn composable pattern:

```tsx
<Citation.Root citation={citation} foundCitation={verification}>
  <Citation.Trigger>
    <Citation.Bracket>
      <Citation.Number />
      <Citation.Indicator />
    </Citation.Bracket>
  </Citation.Trigger>
</Citation.Root>
```

This is exactly the pattern shadcn uses. Great work! 🎉

## 📋 Recommendations for shadcn-like DX

### 1. **Dual Distribution Strategy**

Offer **both** npm package AND copy-paste patterns:

#### Option A: npm Package (Current - Keep This!)
```bash
npm install @deepcitation/deepcitation-js
import { Citation } from '@deepcitation/deepcitation-js/react'
```

**Benefits:**
- Easy updates via npm
- Smaller bundle (tree-shakeable)
- Version management

#### Option B: Copy-Paste via CLI (Add This!)
```bash
npx deepcitation-ui add citation
```

**Benefits:**
- Full source code ownership
- Easy customization
- No dependency lock-in
- Copy what you need

**Recommendation:** Support both! Use npm for primitives, CLI for pre-built compositions.

---

### 2. **Styling Architecture**

#### Current Issue
You have `styles.css` which is fine, but limits customization.

#### Recommended Approach: Unstyled Primitives + Styled Compositions

**Layer 1: Unstyled Primitives** (in npm package)
```tsx
// Already in primitives.tsx - just remove or minimize styles
<Citation.Root className={cn("citation-root", className)} />
```

**Layer 2: Style Presets** (via CLI/docs)

Provide multiple style approaches:

##### A. Tailwind Preset (Recommended)
```tsx
// components/ui/citation.tsx (copied via CLI)
export function CitationBrackets({ citation, verification }) {
  return (
    <Citation.Root citation={citation} foundCitation={verification}>
      <Citation.Trigger className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-sm
        data-[verified]:bg-blue-50 data-[verified]:text-blue-700
        data-[miss]:bg-red-50 data-[miss]:text-red-700
        hover:bg-opacity-80 transition-colors cursor-pointer">
        <Citation.Bracket open="[" close="]" className="text-current">
          <Citation.Number className="font-medium" />
          <Citation.Indicator
            verifiedIndicator={<CheckIcon className="w-3 h-3" />}
            partialIndicator={<WarningIcon className="w-3 h-3" />}
          />
        </Citation.Bracket>
      </Citation.Trigger>
    </Citation.Root>
  )
}
```

##### B. CSS Modules Preset
```tsx
// components/citation.module.css
.trigger {
  display: inline-flex;
  align-items: center;
  /* ... */
}

.trigger[data-verified] { /* ... */ }
```

##### C. Styled Components Preset
```tsx
const StyledTrigger = styled(Citation.Trigger)`
  /* ... */
`
```

**Action Item:** Create `presets/` directory with multiple style approaches.

---

### 3. **Component Organization**

```
src/react/
├── primitives.tsx          # Unstyled building blocks (in npm)
├── hooks.tsx              # Shared hooks (in npm)
├── utils.tsx              # Utilities (in npm)
├── types.ts               # TypeScript types (in npm)
└── presets/               # Pre-built compositions (for CLI/docs)
    ├── citation-brackets.tsx
    ├── citation-inline.tsx
    ├── citation-footnote.tsx
    ├── citation-popover.tsx
    └── registry.json      # Component metadata
```

**Users get:**
- Primitives via `npm install` (always available)
- Compositions via `npx deepcitation-ui add` or copy-paste from docs

---

### 4. **CLI Tool (Optional but High-Value)**

Create `packages/cli/` or separate repo:

```bash
npx deepcitation-ui init      # Setup dependencies, config
npx deepcitation-ui add citation-brackets
npx deepcitation-ui add citation-popover
npx deepcitation-ui diff citation-brackets  # Check for updates
```

**CLI Features:**
- Copy components into user's codebase
- Setup dependencies (Tailwind config, etc.)
- Handle different frameworks (Next.js, Vite, Remix)
- Update tracking

**Tech Stack:**
- Commander.js for CLI
- Prompts for interactive selection
- Cosmiconfig for config files

**Config file example:**
```json
// deepcitation.json
{
  "style": "tailwind",
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

### 5. **Component Registry**

Create a JSON registry for CLI and docs:

```json
// presets/registry.json
{
  "citation-brackets": {
    "name": "citation-brackets",
    "type": "components:ui",
    "files": ["citation-brackets.tsx"],
    "dependencies": ["@deepcitation/deepcitation-js"],
    "devDependencies": [],
    "registryDependencies": [],
    "tailwind": {
      "config": {
        "theme": {
          "extend": {
            "colors": {
              "citation": {
                "verified": "hsl(var(--citation-verified))",
                "miss": "hsl(var(--citation-miss))"
              }
            }
          }
        }
      }
    }
  }
}
```

---

### 6. **Documentation Strategy**

#### Interactive Component Playground

Add to docs site:

```tsx
<ComponentPreview
  component={CitationBrackets}
  code={`
<Citation.Root citation={citation}>
  <Citation.Trigger>
    <Citation.Bracket>
      <Citation.Number />
    </Citation.Bracket>
  </Citation.Trigger>
</Citation.Root>
  `}
/>
```

#### Copy-Paste Ready Examples

Every component page should have:

1. **Preview** - Live interactive demo
2. **Installation** - npm + CLI options
3. **Usage** - Basic example
4. **API Reference** - Props and types
5. **Examples** - Multiple variations
6. **Composition** - How to build custom versions
7. **Customization** - Theming guide

**Example docs page structure:**

```markdown
# Citation Component

<ComponentPreview name="citation-brackets" />

## Installation

### Via CLI (Recommended)
```bash
npx deepcitation-ui add citation-brackets
```

### Manual
Copy and paste the following code into your project:

<CodeBlock>
{/* Full component source */}
</CodeBlock>

## Usage

```tsx
import { CitationBrackets } from "@/components/ui/citation"

<CitationBrackets citation={citation} verification={result} />
```

## Variants

### Inline Citation
<ComponentPreview name="citation-inline" />

### Footnote Style
<ComponentPreview name="citation-footnote" />

## Composition

Build your own using primitives:

```tsx
import { Citation } from "@deepcitation/deepcitation-js/react"

export function CustomCitation() {
  return (
    <Citation.Root>
      {/* Your custom composition */}
    </Citation.Root>
  )
}
```

## API Reference

<ApiReference component="CitationBrackets" />
```

---

### 7. **Theming System**

#### CSS Variables Approach (Recommended)

```css
/* globals.css */
@layer base {
  :root {
    --citation-verified: 217 91% 60%;      /* blue */
    --citation-miss: 0 84% 60%;           /* red */
    --citation-partial: 38 92% 50%;       /* yellow */
    --citation-pending: 215 20% 65%;      /* gray */

    --citation-radius: 0.375rem;
    --citation-font-size: 0.875rem;
  }

  .dark {
    --citation-verified: 217 91% 70%;
    /* ... */
  }
}
```

**In components:**
```tsx
className="bg-citation-verified/10 text-citation-verified"
```

#### Theme Configuration

```typescript
// lib/citation-theme.ts
export const citationTheme = {
  variants: {
    brackets: "inline-flex items-center...",
    inline: "...",
    footnote: "..."
  },
  states: {
    verified: "bg-citation-verified/10 text-citation-verified",
    miss: "bg-citation-miss/10 text-citation-miss",
    // ...
  }
}
```

---

### 8. **Multi-Framework Support**

Provide examples for different frameworks:

```
presets/
├── react/              # Standard React
├── next/              # Next.js (with RSC support)
├── remix/             # Remix
├── astro/             # Astro components
└── vue/               # Vue version (optional)
```

**Next.js specific:**
```tsx
'use client'  // Auto-added by CLI

import { Citation } from '@deepcitation/deepcitation-js/react'
```

---

### 9. **Accessibility Baked In**

All primitives should include:
- Proper ARIA labels (already doing this! ✓)
- Keyboard navigation
- Screen reader announcements
- Focus management

```tsx
<Citation.Trigger
  role="button"
  tabIndex={0}
  aria-label={`Citation ${number}, ${status.isVerified ? 'verified' : 'unverified'}`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Handle activation
    }
  }}
>
```

---

### 10. **Testing Strategy**

Provide test utilities:

```tsx
// test-utils.tsx
export function createMockCitation(overrides?: Partial<Citation>) {
  return {
    citationNumber: 1,
    fullPhrase: "Test phrase",
    pageNumber: 1,
    ...overrides
  }
}

export function createMockVerification(overrides?: Partial<FoundHighlightLocation>) {
  return {
    searchState: { status: 'found' },
    ...overrides
  }
}
```

Users can copy these for their own tests.

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Primitives exist (already done!)
- [ ] Extract styles to CSS variables
- [ ] Create unstyled primitive versions
- [ ] Document primitive composition patterns

### Phase 2: Presets (Week 3-4)
- [ ] Create 5-7 preset compositions
  - [ ] citation-brackets (default)
  - [ ] citation-inline
  - [ ] citation-footnote
  - [ ] citation-popover
  - [ ] citation-minimal
  - [ ] citation-academic
  - [ ] citation-legal
- [ ] Implement in 3 style systems:
  - [ ] Tailwind (primary)
  - [ ] CSS Modules
  - [ ] Vanilla CSS
- [ ] Create component registry JSON

### Phase 3: CLI Tool (Week 5-6)
- [ ] Create CLI package
- [ ] Implement `add` command
- [ ] Implement `init` command
- [ ] Framework detection (Next.js, Vite, etc.)
- [ ] Dependency installation
- [ ] Config file generation

### Phase 4: Documentation (Week 7-8)
- [ ] Component playground
- [ ] Interactive examples
- [ ] Copy-paste code blocks
- [ ] Customization guides
- [ ] Video tutorials
- [ ] Migration guide from npm to CLI

### Phase 5: Advanced Features (Week 9+)
- [ ] Theme builder UI
- [ ] Component variants generator
- [ ] Figma plugin (export → code)
- [ ] VSCode extension (snippets)
- [ ] Storybook integration

---

## 📊 Decision Matrix: What to Keep Where

| Feature | npm Package | CLI/Copy-Paste | Both |
|---------|------------|----------------|------|
| Primitives | ✅ | | |
| Hooks | ✅ | | |
| Utils | ✅ | | |
| Types | ✅ | | |
| Unstyled components | ✅ | | |
| Pre-built compositions | | ✅ | |
| Styled variants | | ✅ | |
| Theme presets | | ✅ | |
| Integration examples | | ✅ | |

---

## 🎨 Example: Complete Citation Component

Here's what a user would get via CLI:

```tsx
// components/ui/citation.tsx (copied into user's project)
'use client'

import { Citation } from '@deepcitation/deepcitation-js/react'
import type { Citation as CitationType, FoundHighlightLocation } from '@deepcitation/deepcitation-js'
import { cn } from '@/lib/utils'
import { Check, AlertCircle } from 'lucide-react'

interface CitationProps {
  citation: CitationType
  verification?: FoundHighlightLocation | null
  variant?: 'brackets' | 'inline' | 'minimal'
  onCitationClick?: (citation: CitationType) => void
}

export function CitationComponent({
  citation,
  verification,
  variant = 'brackets',
  onCitationClick,
}: CitationProps) {
  if (variant === 'minimal') {
    return (
      <Citation.Root citation={citation} foundCitation={verification}>
        <Citation.Trigger
          className={cn(
            "inline-flex items-center gap-1 transition-colors",
            "hover:opacity-80"
          )}
          onCitationClick={onCitationClick}
        >
          <Citation.Number className="text-sm font-medium" />
          <Citation.Indicator
            verifiedIndicator={<Check className="w-3 h-3 text-green-600" />}
            partialIndicator={<AlertCircle className="w-3 h-3 text-yellow-600" />}
          />
        </Citation.Trigger>
      </Citation.Root>
    )
  }

  // ... other variants
}
```

**User can now:**
1. Modify the component freely
2. Adjust styling to match their design system
3. Add custom behavior
4. No version conflicts
5. Full TypeScript support

---

## 📚 Resources

### Inspirations
- [shadcn/ui](https://ui.shadcn.com/) - CLI + copy-paste pattern
- [Radix UI](https://www.radix-ui.com/) - Unstyled primitives
- [Headless UI](https://headlessui.com/) - Behavior-focused components
- [Ark UI](https://ark-ui.com/) - Multi-framework primitives

### Technical References
- [Compound Components Pattern](https://www.patterns.dev/posts/compound-pattern)
- [Polymorphic Components in React](https://www.benmvp.com/blog/polymorphic-react-components-typescript/)
- [CSS Variables for Theming](https://css-tricks.com/a-complete-guide-to-custom-properties/)

---

## 🤔 Key Questions to Answer

1. **CLI vs npm-only?**
   - Recommendation: **Both**. Primitives in npm, compositions via CLI.

2. **Style approach?**
   - Recommendation: **Tailwind-first**, but support all methods.

3. **Framework support?**
   - Recommendation: **React-first**, expand to others if demand exists.

4. **Versioning for CLI components?**
   - Track in component registry, users can `diff` and update manually.

5. **Breaking changes?**
   - npm package: semantic versioning
   - CLI components: users own the code, not your problem! 🎉

---

## 💡 Quick Wins

Start with these for immediate impact:

1. **Extract CSS variables** (2 hours)
   - Move all colors/spacing to CSS vars
   - Enable easy theming

2. **Create 3 preset compositions** (1 day)
   - Brackets (default)
   - Inline
   - Minimal

3. **Add "copy code" buttons to docs** (4 hours)
   - Let users copy component source
   - Track which components are most popular

4. **Create composition guide** (4 hours)
   - Document how to build custom citations
   - Show 5 real-world examples

5. **Expose all primitives** (already done! ✓)
   - Make sure primitives are exported
   - Document each primitive's API

---

## 🎯 Success Metrics

How to measure if the shadcn approach is working:

- **Developer satisfaction**: Survey users, check GitHub stars
- **Customization rate**: How many users modify components vs use as-is
- **CLI adoption**: Downloads of CLI vs npm package
- **Support requests**: Should decrease as users own the code
- **Community contributions**: Users sharing their custom compositions

---

## Final Recommendation

**Go hybrid:**

1. Keep primitives in npm package (easy updates, tree-shakeable)
2. Add CLI for copying pre-built compositions (full control)
3. Focus on Tailwind styling (most popular, best DX)
4. Provide escape hatches for all styling methods
5. Document the hell out of composition patterns

This gives users the **best of both worlds**: npm convenience + copy-paste control.
