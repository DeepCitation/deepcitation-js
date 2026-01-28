# Plan: Citation Tooltip Search Attempt Display

## Overview

Redesign the citation tooltip to show a **verification log timeline** that explains what was searched and why the citation verification succeeded, failed, or produced a partial match. This gives users transparency into the verification process.

## Mockup Analysis

The HTML mockup defines two key scenarios:

1. **Scenario 1: Not Found** (red status) - All search attempts failed
2. **Scenario 2: Line Mismatch** (amber status) - Found but in unexpected location

### Mockup Layout Structure

```
┌─────────────────────────────────────┐
│ Status Bar (red/amber/green)        │  <- Header with icon + status text
├─────────────────────────────────────┤
│ Anchor Label: "Attempting to verify"│
│ Anchor Value: "Liquidity Event..."  │  <- What we're looking for
│                                     │
│ [Quote Box OR Verification Image]   │  <- Visual proof or quoted text
├─────────────────────────────────────┤
│ ▼ Footer: Verification Log          │  <- Collapsible search attempts
│   - Summary: "No matches (0/4)"     │
│   └─ Attempt 1: Exact Line Match    │
│   └─ Attempt 2: Page Scan (Fuzzy)   │
│   └─ Attempt 3: Global Regex        │
└─────────────────────────────────────┘
```

## Current State Analysis

### Existing Components (src/react/CitationComponent.tsx)

- **`DefaultPopoverContent`** (lines 1093-1268): Main tooltip content renderer
- **`SearchedPhrasesInfo`** (lines 880-977): Groups search attempts by phrase
- **`SearchAttemptRow`** (lines 984-1091): Displays a single grouped attempt

### Existing Data Types (src/types/search.ts)

```typescript
interface SearchAttempt {
  method: SearchMethod;           // "exact_line_match", "anchor_text_fallback", etc.
  success: boolean;
  searchPhrase: string;
  searchPhraseType?: "full_phrase" | "anchor_text";
  pageSearched?: number;
  matchedVariation?: MatchedVariation;
  matchedText?: string;
  note?: string;
  durationMs?: number;
}
```

### Gap Analysis

The mockup requires data that isn't currently in `SearchAttempt`:

| Mockup Needs | Current State | Gap |
|--------------|---------------|-----|
| Line ID (e.g., "Line 12") | Only `pageSearched` exists | Need `lineSearched?: number` |
| Expected vs. actual location | Not tracked | Need `expectedLine` vs `foundLine` |
| Similarity scores | Not exposed | Need `similarityScore?: number` |
| Instance count | Not tracked | Need `instancesFound?: number` |

---

## Implementation Plan

### Phase 1: Type Extensions (src/types/search.ts)

Add new optional fields to `SearchAttempt` to support the mockup:

```typescript
export interface SearchAttempt {
  // ... existing fields ...

  // NEW: Location specificity
  lineSearched?: number | number[];     // Line IDs searched
  expectedLocation?: {
    page: number;
    line?: number;
  };
  foundLocation?: {
    page: number;
    line?: number;
  };

  // NEW: Match quality metrics
  similarityScore?: number;             // 0-1 fuzzy match score
  instancesFound?: number;              // How many matches found

  // NEW: Search scope
  searchScope?: "line" | "page" | "document";
}
```

**Backwards Compatible**: All new fields are optional.

---

### Phase 2: New Component - `VerificationLog`

Create a new component that renders the collapsible verification log shown in the mockup footer.

**File**: `src/react/VerificationLog.tsx` (new file)

```typescript
interface VerificationLogProps {
  searchAttempts: SearchAttempt[];
  status: SearchStatus;
  expectedPage?: number;
  expectedLine?: number;
  foundPage?: number;
  foundLine?: number;
  defaultExpanded?: boolean;
}
```

**Subcomponents**:

1. **`VerificationLogSummary`** - The clickable summary header
   - Shows overall result icon (✗ red, △ amber, ✓ green)
   - Shows result text: "No matches found", "Found on Line 84", etc.
   - Shows attempt count: "(0/4 attempts)", "(Expected Line 14)"

2. **`VerificationLogTimeline`** - The expandable attempt list
   - Vertical timeline with connecting lines
   - Each attempt as a card with:
     - Status icon (✗ gray for failed, ✓ green/amber for success)
     - Method name (e.g., "Exact Line Match", "Page Scan (Fuzzy)")
     - Scope badge (e.g., "Pg 3 : Line 12", "Entire Doc")
     - Result text (error message or match details)

3. **`VerificationLogAttempt`** - Single attempt row
   - Icon column (status indicator)
   - Details column (method + scope + result)

---

### Phase 3: Update `DefaultPopoverContent`

Modify the popover to use the new layout from the mockup.

**Current Structure**:
```
[Image or Loading or Miss or Text-only]
```

**New Structure**:
```
┌─────────────────────────────────┐
│ StatusHeader (new)              │
├─────────────────────────────────┤
│ VerificationContent             │
│  - AnchorLabel + AnchorValue    │
│  - Image OR QuoteBox            │
│  - DiffDetails (if partial)     │
├─────────────────────────────────┤
│ VerificationLog (collapsible)   │
│  - Shows when not_found/partial │
└─────────────────────────────────┘
```

**Changes to `DefaultPopoverContent`**:

1. Add new `StatusHeader` component at top of popover
2. Add "Attempting to verify" label with anchorText
3. Keep existing image rendering logic
4. Add `QuoteBox` component for no-image cases
5. Move `SearchedPhrasesInfo` into new `VerificationLog`
6. Wrap log in `<details>/<summary>` for collapsibility

---

### Phase 4: Status Header Component

**File**: Add to `src/react/CitationComponent.tsx` or new file

```typescript
function StatusHeader({ status, statusLabel }: StatusHeaderProps) {
  // Red: not_found
  // Amber: found_on_other_page, found_on_other_line, partial_text_found
  // Green: found, found_anchor_text_only

  const colorClass = status.isMiss ? "red" : status.isPartialMatch ? "amber" : "green";

  return (
    <div className={cn(
      "px-4 py-2.5 flex items-center gap-2 border-b font-semibold text-sm",
      colorClass === "red" && "bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
      colorClass === "amber" && "bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
      colorClass === "green" && "bg-green-50 border-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
    )}>
      <WarningIcon /> {/* or CheckIcon for green */}
      {statusLabel}
    </div>
  );
}
```

---

### Phase 5: Quote Box Component

For cases where no verification image exists, show the quoted phrase in a styled box.

```typescript
function QuoteBox({ phrase }: { phrase: string }) {
  return (
    <blockquote className="font-serif italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border-l-3 border-gray-300 dark:border-gray-600 leading-relaxed">
      "{phrase}"
    </blockquote>
  );
}
```

---

### Phase 6: Styling Updates

Use Tailwind CSS classes matching the mockup:

**Status Bar Colors**:
- Red: `bg-red-50 border-red-200 text-red-800`
- Amber: `bg-amber-50 border-amber-200 text-amber-800`
- Green: `bg-green-50 border-green-200 text-green-800`

**Log Timeline**:
- `max-h-[200px] overflow-y-auto` for scrollable log
- `border-b border-dashed border-gray-200` between attempts
- Scope badges: `bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-mono`
- Highlight badges: `bg-red-100 text-red-800` for expected location, `bg-green-100 text-green-800` for found location

---

### Phase 7: Method Label Mapping

Extend the existing `getMethodLabel` function or create a new one with user-friendly names:

```typescript
const METHOD_DISPLAY_NAMES: Record<SearchMethod, string> = {
  exact_line_match: "Exact Line Match",
  line_with_buffer: "Line Buffer Search",
  current_page: "Current Page Scan",
  anchor_text_fallback: "Anchor Text Fallback",
  adjacent_pages: "Adjacent Pages",
  expanded_window: "Expanded Window",
  regex_search: "Global Regex",
  first_word_fallback: "First Word Search",
};
```

---

### Phase 8: Conditional Display Logic

Different tooltip layouts based on verification status:

| Status | Layout | Quote Box? | Expandable Log? |
|--------|--------|------------|-----------------|
| `found` | Minimal (green bar only) | No | No |
| `found_anchor_text_only` | Minimal (green bar only) | No | No |
| `found_on_other_page` | Full (header + quote + log) | Yes | Yes (collapsed) |
| `found_on_other_line` | Full (header + quote + log) | Yes | Yes (collapsed) |
| `partial_text_found` | Full (header + quote + log) | Yes | Yes (collapsed) |
| `not_found` | Full (header + quote + log) | Yes | Yes (collapsed) |
| `pending`/`loading` | Loading spinner | No | No |

**Click behavior**: Clicking anywhere on the tooltip expands the verification log (for statuses that have one).

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/search.ts` | Modify | Add new optional fields to `SearchAttempt` |
| `src/react/VerificationLog.tsx` | Create | New component for collapsible log |
| `src/react/CitationComponent.tsx` | Modify | Update `DefaultPopoverContent` layout |
| `src/react/index.ts` | Modify | Export new components if needed |

---

## Testing Considerations

1. **Visual regression tests**: Add Playwright tests for each status scenario
2. **Accessibility**: Ensure collapsible log works with keyboard navigation
3. **Dark mode**: Verify all new colors work in dark mode
4. **Edge cases**:
   - Empty searchAttempts array
   - Very long phrases (truncation)
   - Many attempts (scrolling)
   - Missing optional fields (backwards compatibility)

---

## Migration Path

This is additive and backwards compatible:
- New fields in `SearchAttempt` are optional
- Existing tooltip behavior preserved when new data isn't present
- Can ship incrementally (API changes separately from UI)

---

## Interaction Behavior

**Default State**: Log is always **collapsed** by default.

**Expansion Trigger**: Clicking on the CitationComponent or anywhere in the tooltip/popover expands the verification log.

**Three Visual States**:

1. **Success (Green)** - Minimal footer bar only:
   ```
   ┌─────────────────────────────────────┐
   │ ✓ Verified Match              PG 2 │
   └─────────────────────────────────────┘
   ```
   - No quote box, no "Attempting to verify" section
   - Just a simple green confirmation bar with page badge

2. **Not Found (Red)** - Full layout, collapsed log:
   ```
   ┌─────────────────────────────────────┐
   │ △ Citation Unverified              │  <- Red header
   ├─────────────────────────────────────┤
   │ ATTEMPTING TO VERIFY:              │
   │ Liquidity Event Definition         │
   │                                     │
   │ "Returns are primarily dictated..." │  <- Quote box
   ├─────────────────────────────────────┤
   │ ✗ No matches found (0/4 attempts) ▼│  <- Collapsed log
   └─────────────────────────────────────┘
   ```

3. **Partial/Displaced (Amber)** - Full layout, collapsed log:
   ```
   ┌─────────────────────────────────────┐
   │ △ Citation Found (Unexpected Loc.) │  <- Amber header
   ├─────────────────────────────────────┤
   │ ATTEMPTING TO VERIFY:              │
   │ 8% annual interest rate            │
   │                                     │
   │ "This Safe shall accrue interest..." │
   ├─────────────────────────────────────┤
   │ △ Found on Line 84 (Expected 14) ▼ │  <- Collapsed log
   └─────────────────────────────────────┘
   ```

---

## Status-Specific Rendering

| Status | Header Text | Header Color | Show Quote Box? | Footer Text |
|--------|-------------|--------------|-----------------|-------------|
| `found` | "Verified Match" | Green | No | "PG {n}" badge only |
| `found_anchor_text_only` | "Verified Match" | Green | No | "PG {n}" badge only |
| `found_on_other_line` | "Citation Found (Unexpected Location)" | Amber | Yes | "Found on Line {x} (Expected Line {y})" |
| `found_on_other_page` | "Citation Found (Unexpected Location)" | Amber | Yes | "Found on Page {x} (Expected Page {y})" |
| `partial_text_found` | "Partial Match Found" | Amber | Yes | "Partial match (X/Y attempts)" |
| `not_found` | "Citation Unverified" | Red | Yes | "No matches found (0/X attempts)" |

---

## Open Questions

1. ~~Should the log be expanded by default for `not_found` status?~~ **Answered: Always collapsed**
2. Should we show timing info (e.g., "took 45ms")?
3. Do we need an API change to return line-level location data?
