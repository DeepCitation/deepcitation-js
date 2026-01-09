# Citation Presets - Tailwind Styled Components

Pre-built, customizable citation components styled with Tailwind CSS. Copy, paste, and customize to match your design system.

## 📦 Installation

```bash
npm install @deepcitation/deepcitation-js
```

Make sure you have Tailwind CSS configured in your project.

## 🎨 Available Presets

### 1. CitationBrackets

Classic bracketed citation style with verification indicators.

**Result:** `[1✓]`

```tsx
import { CitationBrackets } from '@deepcitation/deepcitation-js/react/presets'

<CitationBrackets
  citation={citation}
  foundCitation={verification}
  size="default" // "sm" | "default" | "lg"
  variant="default" // "default" | "primary" | "secondary" | "accent"
/>
```

**Features:**
- Auto color-coding by verification status
- Multiple size variants
- Custom brackets support
- Accessible with ARIA labels

### 2. CitationInline

Inline citation without brackets, perfect for embedding values in text.

**Result:** `25%✓`

```tsx
import { CitationInline } from '@deepcitation/deepcitation-js/react/presets'

<CitationInline
  citation={{ value: "25%", citationNumber: 1 }}
  foundCitation={verification}
  indicatorPosition="after" // "before" | "after"
  showUnderline={true}
/>
```

**Features:**
- Seamless inline integration
- Configurable indicator position
- Optional hover underline
- Subtle color coding

### 3. CitationMinimal

Compact citation showing just number and indicator.

**Result:** `1✓`

```tsx
import { CitationMinimal } from '@deepcitation/deepcitation-js/react/presets'

<CitationMinimal
  citation={citation}
  foundCitation={verification}
  variant="subtle" // "subtle" | "bold" | "ghost"
/>
```

**Features:**
- Minimal footprint
- Three style variants
- Perfect for dense text
- Academic paper friendly

### 4. CitationSuperscript

Academic-style superscript citations.

**Result:** `text¹`

```tsx
import { CitationSuperscript } from '@deepcitation/deepcitation-js/react/presets'

<CitationSuperscript
  citation={citation}
  foundCitation={verification}
  showBrackets={false}
  variant="default" // "default" | "colored"
/>
```

**Features:**
- Standard superscript positioning
- Optional brackets `[¹]`
- Perfect for research papers
- Multiple citation support

## 🎯 Quick Start Examples

### Basic Usage

```tsx
import { CitationBrackets } from '@deepcitation/deepcitation-js/react/presets'

function MyComponent() {
  const citation = {
    citationNumber: 1,
    fullPhrase: "Revenue increased by 25%",
    pageNumber: 12,
    lineId: "5"
  }

  const verification = {
    searchState: { status: 'found' }
  }

  return (
    <p>
      The company saw strong growth
      <CitationBrackets citation={citation} foundCitation={verification} />
      {" "}in Q4.
    </p>
  )
}
```

### Inline Values

```tsx
import { CitationInline } from '@deepcitation/deepcitation-js/react/presets'

<p>
  Revenue grew by{" "}
  <CitationInline
    citation={{ value: "25%", citationNumber: 1 }}
    foundCitation={verification}
  />{" "}
  year-over-year.
</p>
```

### Academic Citations

```tsx
import { CitationSuperscript } from '@deepcitation/deepcitation-js/react/presets'

<p>
  This finding has been replicated
  <CitationSuperscript citation={{ citationNumber: 1 }} />
  in multiple studies.
</p>
```

## 🎨 Customization

### Using className Props

All presets accept className props for easy customization:

```tsx
<CitationBrackets
  citation={citation}
  className="my-root-class"
  triggerClassName="hover:scale-110 transition-transform"
  bracketClassName="font-mono"
/>
```

### Size Variants

```tsx
// Small
<CitationBrackets size="sm" />

// Default
<CitationBrackets size="default" />

// Large
<CitationBrackets size="lg" />
```

### Custom Colors

Override Tailwind classes:

```tsx
<CitationBrackets
  triggerClassName={cn(
    "[&.citation-trigger--verified]:bg-green-50",
    "[&.citation-trigger--verified]:text-green-700"
  )}
/>
```

## 🧩 Composing Your Own

Need full control? Use the primitives:

```tsx
import { Citation } from '@deepcitation/deepcitation-js/react/primitives'
import { cn } from '@deepcitation/deepcitation-js/react/utils'

export function MyCustomCitation({ citation, verification }) {
  return (
    <Citation.Root citation={citation} foundCitation={verification}>
      <Citation.Trigger className={cn(
        "inline-flex items-center gap-1",
        "px-2 py-1 rounded-full",
        "bg-gradient-to-r from-blue-500 to-purple-500",
        "text-white font-bold",
        "hover:shadow-lg transition-shadow"
      )}>
        <span className="text-xs">REF</span>
        <Citation.Number />
        <Citation.Indicator verifiedIndicator="✓" />
      </Citation.Trigger>
    </Citation.Root>
  )
}
```

## 📋 All Props Reference

### Common Props (All Presets)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `citation` | `Citation` | **required** | Citation data object |
| `foundCitation` | `FoundHighlightLocation \| null` | `null` | Verification result |
| `className` | `string` | - | Custom class for root element |
| `triggerClassName` | `string` | - | Custom class for trigger element |
| `onCitationClick` | `function` | - | Click handler |
| `onCitationMouseEnter` | `function` | - | Mouse enter handler |
| `onCitationMouseLeave` | `function` | - | Mouse leave handler |
| `isMobile` | `boolean` | `false` | Enable mobile interactions |
| `disableHover` | `boolean` | `false` | Disable hover effects |

### CitationBrackets Specific

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showIndicator` | `boolean` | `true` | Show verification indicator |
| `openBracket` | `string` | `"["` | Opening bracket character |
| `closeBracket` | `string` | `"]"` | Closing bracket character |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | Size variant |
| `variant` | `"default" \| "primary" \| ...` | `"default"` | Color variant |

### CitationInline Specific

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `indicatorPosition` | `"before" \| "after"` | `"after"` | Indicator placement |
| `showUnderline` | `boolean` | `true` | Show underline on hover |

### CitationMinimal Specific

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"subtle" \| "bold" \| "ghost"` | `"subtle"` | Style variant |

### CitationSuperscript Specific

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showBrackets` | `boolean` | `false` | Wrap number in brackets |
| `variant` | `"default" \| "colored"` | `"default"` | Style variant |

## 🎨 Tailwind Configuration

For best results, ensure your `tailwind.config.js` includes the source files:

```js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@deepcitation/deepcitation-js/**/*.{js,jsx,ts,tsx}',
  ],
  // ... rest of config
}
```

## 💡 Tips

1. **Status Colors**: All presets automatically style based on verification status
2. **Accessibility**: All components include proper ARIA labels
3. **TypeScript**: Full type definitions included
4. **Tree-shaking**: Import only what you need
5. **Customization**: Every aspect can be customized via props

## 📚 Learn More

- [Primitives Documentation](../primitives.tsx) - Build custom components
- [Main Documentation](https://deepcitation.github.io/deepcitation-js/)
- [Examples](../../../examples/)

## 🤝 Contributing

Want to add a new preset? Check our [Contributing Guide](../../CONTRIBUTING.md).
