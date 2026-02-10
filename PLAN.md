# Plan: Citation Drawer & Popover UX Improvements

## Issues Identified (from screenshots + code review)

### CitationDrawerTrigger (collapsed bar)
1. **"J" letter confusion**: When no favicon is available, the trigger shows the first letter of the source name (e.g., "J" for "Junior to payment") as a circle — looks like a meaningless icon
2. **Single warning icon dominates**: When there's 1 miss among 4 verified, the collapsed bar shows a single amber warning triangle per-group, which overpowers. Should show per-citation status indicators (checkmarks and X's)
3. **Redundant text summary**: Bar says "5 sources . 4 verified, 1 not found" but the icons should already convey this — text restates what icons show
4. **"Not found" uses amber warning instead of red X**: In `getStatusInfo()`, `not_found` maps to amber `WarningIcon` — should be red `XCircleIcon` for unmistakable miss clarity

### CitationDrawer (expanded)
5. **Expand/collapse toggle adds friction**: Drawer has show/hide, plus within it a further expand/collapse for snippets. Should be always expanded and scrollable
6. **Icons in drawer items are ambiguous for misses**: Each citation shows a small icon but miss entries don't stand out enough — should be clearer visual treatment
7. **Too much top padding/margin**: Handle bar + header area takes up too much vertical space
8. **No way to navigate from drawer back to visual evidence**: Clicking a citation in the drawer should surface the proof image

### CitationPopover
9. **Page badge format inconsistency**: Drawer uses compact "p.4" format, popover uses uppercase "PAGE 5". Should use consistent "p.N" format everywhere
10. **Top margin/padding is excessive**: SourceContextHeader + StatusHeader creates a double-header look

## Implementation Plan

### Step 1: Fix "not_found" status indicator color and icon
**File**: `src/react/CitationDrawer.utils.tsx` (lines 81-87)

Change `getStatusInfo()` for `not_found`:
- Icon: `WarningIcon` -> `XCircleIcon` (imported from icons.js)
- Color: `text-amber-500` -> `text-red-500`

This single change fixes the miss icon in drawer items, trigger status chips, and trigger tooltips.

### Step 2: CitationDrawerTrigger — per-citation icons, not per-group
**File**: `src/react/CitationDrawerTrigger.tsx`

**StatusIconChip changes**:
- Currently renders one icon per SOURCE GROUP using the group's "worst" status
- Change to render one icon per CITATION, showing each citation's actual verification status
- Flatten `citationGroups` into individual citation items, each getting its own chip
- Remove the letter-circle fallback from status chips — chips only show status icons (check/X/spinner), never source initials

**StackedStatusIcons changes**:
- Accept flattened citation items instead of groups
- Each icon represents one citation's verification status
- On hover, spread icons and show tooltip for the hovered citation (source name, status, proof thumbnail)

**Label simplification**:
- `generateDefaultLabel()`: When icons clearly convey status, simplify to just "N sources" — drop the verbose "N verified, N not found" breakdown since the icons already communicate that
- Keep the detailed breakdown only in the tooltip on hover

### Step 3: Simplify CitationDrawer — remove expand/collapse, always scrollable
**File**: `src/react/CitationDrawer.tsx`

- Remove `showMore`/`setShowMore` state
- Remove the `visibleGroups`/`hasMore`/`moreCount` memo — always show all groups
- Remove the "More (N)" button
- Keep `showMoreSection` and `maxVisibleItems` props in types for backwards compat but ignore them
- Remove `collapsedGroups` state and `toggleGroup` — groups are always expanded (remove `SourceGroupHeader` toggle behavior, keep it as a static label)

**Reduce top padding**:
- Handle bar: `pt-3 pb-1` -> `pt-2 pb-0.5`
- Header: `py-3` -> `py-2`

**File**: `src/react/CitationDrawer.types.ts`
- Mark `showMoreSection` and `maxVisibleItems` as `@deprecated` in JSDoc

### Step 4: Improve drawer item miss clarity
**File**: `src/react/CitationDrawer.tsx` (CitationDrawerItemComponent)

- For `not_found` citations: add a subtle left border accent (`border-l-2 border-red-400`) and a light red background on hover (`hover:bg-red-50 dark:hover:bg-red-900/10`)
- The status icon change from Step 1 already gives us the red XCircleIcon — combine with the visual accent for unmistakable miss indication

### Step 5: Add "View evidence" navigation from drawer
**File**: `src/react/CitationDrawer.tsx` (CitationDrawerItemComponent)

- When `verification.verificationImageBase64` exists AND `onClick` is provided, make the proof image thumbnail more prominent
- Add a small "View proof" text link or icon button below the proof thumbnail
- Ensure clicking the proof thumbnail (which already exists) invokes `onClick(item)` — this already works, but make it more discoverable with a hover state and cursor change

### Step 6: Unify page badge format — use "p.N" everywhere
**File**: `src/react/VerificationLog.tsx`

- `formatPageLineText()` (line 380-388): Change `Page ${pageNumber}` -> `p.${pageNumber}`
- `PageBadge` component (lines 623-647): Change `Page ${expectedPage}` -> `p.${expectedPage}`, `Page ${pageToShow}` -> `p.${pageToShow}`
- `SourceContextHeader` document header (line 364): The right-aligned text uses `formatPageLineText` — will auto-update
- URL citation header: Leave as-is (URLs don't have page numbers in the same way)

### Step 7: Reduce popover top padding
**Files**: `src/react/VerificationLog.tsx`, `src/react/CitationComponent.tsx`

- `SourceContextHeader` document layout: `py-2` -> `py-1.5`
- `StatusHeader`: `py-2.5` -> `py-2` (compact already uses `py-2`)
- In `DefaultPopoverContent`: The loading state `p-3` gap could be tightened to `p-2`

### Step 8: Update snapshot tests
**Files**: `tests/playwright/specs/__snapshots__/**`

- Run playwright tests — all visual snapshots will fail due to the UI changes
- Update baselines with `--update-snapshots`
- Verify the new snapshots look correct

## Files Changed Summary
| File | Changes |
|------|---------|
| `src/react/CitationDrawer.utils.tsx` | Fix not_found icon/color |
| `src/react/CitationDrawerTrigger.tsx` | Per-citation icons, simplified label |
| `src/react/CitationDrawer.tsx` | Remove expand/collapse, reduce padding, miss accents |
| `src/react/CitationDrawer.types.ts` | Deprecate showMoreSection/maxVisibleItems |
| `src/react/VerificationLog.tsx` | Consistent "p.N" format, reduced padding |
| `src/react/CitationComponent.tsx` | Reduced popover top padding |
| `tests/playwright/specs/__snapshots__/**` | Updated baselines |

## Backwards Compatibility
- `showMoreSection` and `maxVisibleItems` props accepted but ignored (no-ops)
- `CitationDrawerItemComponent` click handler unchanged
- Status indicator mapping changes are visual only — API/data shapes unchanged
- `StatusIconChip` internal component, not exported — safe to refactor
