# Testing Guide - Tailwind Presets

This guide helps you test and preview the new Tailwind citation presets.

## 🚀 Quick Start - Visual Preview

### Option 1: Using the Demo Component (Recommended)

1. **Build the package:**
   ```bash
   npm run build
   ```

2. **Create a test app** (if you don't have one):
   ```bash
   # Using Vite + React + Tailwind
   npm create vite@latest test-app -- --template react-ts
   cd test-app
   npm install
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Configure Tailwind** to scan the presets:
   ```js
   // tailwind.config.js
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
       "../src/react/presets/**/*.{js,ts,jsx,tsx}", // Add this line
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

4. **Copy the demo file:**
   ```bash
   cp examples/presets-demo.tsx test-app/src/PresetsDemo.tsx
   ```

5. **Update imports** in the demo file:
   ```tsx
   // Change from:
   import { CitationBrackets } from '../presets/index.js';

   // To:
   import { CitationBrackets } from '@deepcitation/deepcitation-js/react/presets';
   ```

6. **Use the demo in your app:**
   ```tsx
   // src/App.tsx
   import { CitationPresetsDemo } from './PresetsDemo'

   function App() {
     return <CitationPresetsDemo />
   }
   ```

7. **Run the dev server:**
   ```bash
   npm run dev
   ```

8. **Open in browser** and toggle between verification states!

### Option 2: Quick Inline Test

Create a minimal test file:

```tsx
// test.tsx
import React from 'react';
import { CitationBrackets, CitationInline } from '@deepcitation/deepcitation-js/react/presets';

export function QuickTest() {
  const citation = {
    citationNumber: 1,
    fullPhrase: "Test citation",
    pageNumber: 1,
    lineId: "5"
  };

  const verification = {
    searchState: { status: 'found' as const }
  };

  return (
    <div className="p-8">
      <p className="text-lg">
        Testing citations:
        <CitationBrackets citation={citation} foundCitation={verification} />
        and inline
        <CitationInline citation={{ value: "25%", citationNumber: 2 }} foundCitation={verification} />
      </p>
    </div>
  );
}
```

## 🧪 Manual Testing Checklist

### All Presets

For each preset (`CitationBrackets`, `CitationInline`, `CitationMinimal`, `CitationSuperscript`):

- [ ] **Verified state** (blue) - `searchState: { status: 'found' }`
- [ ] **Partial match state** (yellow) - `searchState: { status: 'partial_text_found' }`
- [ ] **Not found state** (red) - `searchState: { status: 'not_found' }`
- [ ] **Pending state** (gray) - `searchState: { status: 'pending' }`
- [ ] **Hover effects** work
- [ ] **Click callbacks** fire correctly
- [ ] **Focus states** show ring outline
- [ ] **Keyboard navigation** (Tab, Enter, Space)
- [ ] **Responsive** on mobile/tablet/desktop

### CitationBrackets Specific

- [ ] Size variants: `sm`, `default`, `lg`
- [ ] Color variants: `default`, `primary`, `secondary`, `accent`
- [ ] Custom brackets: `openBracket="("` `closeBracket=")"`
- [ ] `showIndicator={false}` hides checkmark
- [ ] Custom classNames work

### CitationInline Specific

- [ ] Indicator position: `before` and `after`
- [ ] `showUnderline={true}` shows dotted underline on hover
- [ ] `showUnderline={false}` removes underline
- [ ] Size variants: `sm`, `default`, `lg`

### CitationMinimal Specific

- [ ] Variants: `subtle`, `bold`, `ghost`
- [ ] Size variants work correctly
- [ ] Compact in dense text

### CitationSuperscript Specific

- [ ] Default superscript positioning
- [ ] `showBrackets={true}` adds brackets
- [ ] Variants: `default`, `colored`
- [ ] Multiple citations in sequence

## 🎨 Visual Regression Testing

Check these visual aspects:

### Colors
- [ ] Verified: Blue background (#eff6ff), blue text (#1d4ed8)
- [ ] Partial: Yellow background (#fefce8), yellow text (#a16207)
- [ ] Miss: Red background (#fef2f2), red text (#b91c1c)
- [ ] Pending: Gray background (#f9fafb), gray text (#6b7280)

### Spacing
- [ ] Proper padding inside citations
- [ ] Correct gap between elements
- [ ] Inline citations don't break text flow
- [ ] Superscripts positioned correctly

### Typography
- [ ] Numbers use tabular-nums (consistent width)
- [ ] Font sizes scale correctly
- [ ] Line height doesn't break

### Interactions
- [ ] Smooth hover transitions (150ms)
- [ ] Focus ring visible and properly styled
- [ ] Cursor changes to pointer
- [ ] Active states feel responsive

## 📱 Browser Testing

Test in these browsers:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## ♿ Accessibility Testing

- [ ] Screen reader announces citation properly
- [ ] Keyboard-only navigation works
- [ ] Focus indicators clearly visible
- [ ] Color contrast meets WCAG AA
- [ ] Works with browser zoom (up to 200%)

## 🔧 Integration Testing

### With Tailwind CSS

Test that Tailwind classes work:

```tsx
<CitationBrackets
  className="custom-class"
  triggerClassName="hover:scale-110 transition-transform"
/>
```

- [ ] Custom classes apply correctly
- [ ] Tailwind utilities override defaults
- [ ] No class conflicts

### With CSS Modules

```tsx
import styles from './styles.module.css'

<CitationBrackets className={styles.citation} />
```

- [ ] CSS Modules classes work
- [ ] Can override Tailwind styles

### With Styled Components

```tsx
const StyledCitation = styled(CitationBrackets)`
  /* custom styles */
`
```

- [ ] Component works with CSS-in-JS
- [ ] Props pass through correctly

## 🧩 Composition Testing

Test custom compositions with primitives:

```tsx
import { Citation } from '@deepcitation/deepcitation-js/react/primitives'
import { cn } from '@deepcitation/deepcitation-js/react/utils'

<Citation.Root citation={citation} foundCitation={verification}>
  <Citation.Trigger className={cn("custom-classes")}>
    <Citation.Number />
    <Citation.Indicator />
  </Citation.Trigger>
</Citation.Root>
```

- [ ] Primitives work as documented
- [ ] `cn()` utility merges classes correctly
- [ ] Custom compositions render properly
- [ ] Context providers work

## 📊 Performance Testing

- [ ] No layout shift when citations load
- [ ] Smooth rendering with 100+ citations on page
- [ ] No memory leaks with mount/unmount cycles
- [ ] Event handlers don't cause re-renders

## 🐛 Common Issues & Solutions

### Issue: "Module not found: @deepcitation/deepcitation-js/react/presets"

**Solution:** Make sure you've built the package (`npm run build`)

### Issue: Tailwind styles not applied

**Solution:** Update `tailwind.config.js` content array:
```js
content: [
  './src/**/*.{js,jsx,ts,tsx}',
  './node_modules/@deepcitation/deepcitation-js/**/*.{js,tsx}',
]
```

### Issue: Colors not showing

**Solution:** Ensure Tailwind CSS is properly configured and styles are imported.

### Issue: TypeScript errors

**Solution:** Run `npm run build` to generate type definitions.

## 📸 Screenshots

When testing, capture screenshots of:

1. All 4 presets in default state
2. Each preset in all 4 verification states
3. Size variants for each preset
4. Presets in actual text context
5. Mobile view
6. Dark mode (if applicable)

## ✅ Test Report Template

```markdown
## Test Results

**Environment:**
- OS:
- Browser:
- Node version:
- Package version:

**Presets Tested:**
- [ ] CitationBrackets
- [ ] CitationInline
- [ ] CitationMinimal
- [ ] CitationSuperscript

**States Verified:**
- [ ] Verified (blue)
- [ ] Partial (yellow)
- [ ] Miss (red)
- [ ] Pending (gray)

**Issues Found:**
1.
2.

**Screenshots:**
[Attach screenshots]

**Overall Status:** ✅ Pass / ❌ Fail
```

## 🚢 Ready to Ship Checklist

Before merging:

- [ ] All manual tests pass
- [ ] Visual regression tests pass
- [ ] Accessibility tests pass
- [ ] Browser compatibility confirmed
- [ ] No console errors/warnings
- [ ] Documentation is accurate
- [ ] Examples work correctly
- [ ] TypeScript types are correct
- [ ] Build succeeds without errors
- [ ] Package size is reasonable

## 📞 Need Help?

- Check the [README](../src/react/presets/README.md)
- Review [component architecture docs](./COMPONENT_ARCHITECTURE.md)
- Ask in GitHub Discussions
