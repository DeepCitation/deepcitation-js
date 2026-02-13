# Remaining UX Tasks (Delegate)

These items were scoped in `DESIGN_FEEDBACK.md` but not completed in this PR. They are lower-priority P2 drawer layout refinements that require more invasive structural changes.

---

## Task 1: Remove source name repetition from drawer citation rows (#8)

**File:** `src/react/CitationDrawer.tsx` — `CitationDrawerItemComponent`

**Problem:** Each citation row within a group shows the source name again (e.g., "React ✓" inside the React group header). The source name appears 3x: group header, citation item source line, and implicitly in the fullPhrase.

**Change:**
- The `hideSourceName` prop was already added to `CitationDrawerItemProps` in `CitationDrawer.types.ts`
- Wire it up: when `hideSourceName={true}`, skip rendering the source name line in `CitationDrawerItemComponent`
- Pass `hideSourceName={true}` when rendering items within a `SourceGroupHeader` context
- Citation rows inside groups should show only: status icon + anchor text/title + page number

**Acceptance:** Within a grouped drawer, source name appears only in the group header, not repeated on each citation row.

---

## Task 2: Collapse single-citation groups into one compact row (#11)

**File:** `src/react/CitationDrawer.tsx`

**Problem:** A source with 1 citation renders as: collapsible group header row (with ▼ chevron) + separate citation item row. The chevron implies collapsible content, but there's only one item — the two-level layout is wasted space.

**Change:**
- When a `SourceCitationGroup` has exactly 1 citation, render a single compact row instead of header + item
- Compact row layout: `[favicon/letter avatar] Source Name · status-icon · "anchor text" · p.N`
- Keep the two-level collapsible layout only for groups with 2+ citations

**Acceptance:** Single-citation groups render as one row. Multi-citation groups still have collapsible header + items.

---

## Task 3: Remove right-side favicon letter badges from collapsed trigger (#15)

**File:** `src/react/CitationDrawerTrigger.tsx`

**Problem:** The collapsed trigger bar shows tiny colored circles with single letters (R, T, N) on the right side. At trigger bar size, these are unreadable and add visual noise without conveying information.

**Change:**
- Find where the right-side letter/favicon badges are rendered in the trigger (separate from the left-side stacked status icons)
- Remove them from the collapsed/default state
- These source identifiers are better shown in the drawer itself or during the hover-spread animation

**Acceptance:** Collapsed trigger shows only left-side status icons + label + chevron. No tiny letter badges on the right.

---

## Task 4: Copy button on fullPhrase quote area (#18 — partially done)

**File:** `src/react/CitationComponent.tsx`

**Problem:** The copy button was removed from the StatusHeader (anchor text echo is gone). Users who want to Ctrl+F a phrase in their own document need a way to copy the `fullPhrase`.

**Change:**
- Add a copy button to the `HighlightedPhrase` display area (added in this PR)
- Hidden by default, shown on hover of the quote area
- Copies `fullPhrase` (not anchor text) — this is what users need for search
- Tooltip: "Copy source quote"

**Acceptance:** Hovering the fullPhrase quote shows a copy button. Clicking it copies the full phrase to clipboard with "Copied!" feedback.

---

## Task 5: Merge anchor text and fullPhrase in drawer items (#10 — utility exists, not wired up)

**File:** `src/react/CitationDrawer.tsx`

**Problem:** Drawer citation rows show both anchor text (bold) and fullPhrase (regular), which stutter when anchor text is a substring of fullPhrase.

**Change:**
- The `renderPhraseWithHighlight()` utility was already added to `CitationDrawer.tsx` in this PR
- Wire it into `CitationDrawerItemComponent`: when `anchorText` is a substring of `fullPhrase` and `fullPhrase` has 2+ more words, show only `fullPhrase` with the `anchorText` portion in `<strong>`
- When they're identical or near-identical, show once without highlight

**Acceptance:** Drawer items show one combined phrase instead of two near-duplicate lines.
