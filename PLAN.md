# AG-UI Protocol Integration Design — DeepCitation

## Overview

This document describes how DeepCitation should integrate with the [AG-UI protocol](https://github.com/ag-ui-protocol/ag-ui) to enable citation verification in any AG-UI-compliant agent frontend.

AG-UI is an open protocol for connecting AI agent backends to frontend UIs. It defines a streaming event system (text messages, tool calls, state deltas, custom events) and a middleware model for intercepting and augmenting agent event streams.

## Recommended Approach: Hybrid Middleware + State (Approach E)

### Why This Approach

Five approaches were evaluated:

| Approach | Summary | Verdict |
|----------|---------|---------|
| A. Pure Middleware | Transform events in-flight | Cannot emit new events after stream ends (verification is async) |
| B. Frontend Tool | LLM calls a `verify_citations` tool | Breaks transparency — requires agent cooperation |
| C. Custom Events | Fire-and-forget citation events | No state reconciliation on reconnection |
| D. Pure State | All data via `STATE_DELTA` | Cannot intercept text stream for accumulation |
| **E. Hybrid** | **Middleware intercepts stream + emits state deltas** | **Best of both — transparent, async-safe, reconnectable** |

**Approach E** is recommended because:
- Works with **any** AG-UI agent — no agent cooperation required
- Handles streaming gracefully — text events pass through immediately
- Supports incremental verification via `STATE_DELTA` events
- State-based data survives frontend reconnection (via snapshots)
- Reuses all existing DeepCitation utilities unchanged

### Architecture

```
AG-UI Agent  -->  DeepCitationMiddleware  -->  Frontend
     |                    |                       |
     |  TEXT_MESSAGE_*    |  (pass through)       |  Render text as it streams
     |  ================>|======================>|
     |                    |                       |
     |  TEXT_MESSAGE_END  |  Extract citations    |
     |  ================>|  --> STATE_DELTA       |  Receive citations
     |                    |      (citations)  ===>|
     |                    |                       |
     |                    |  Verify async         |
     |                    |  --> STATE_DELTA       |  Receive verifications
     |                    |      (verifications)==>|  incrementally
```

## AG-UI State Schema

The middleware manages state under a configurable key (default: `"deepcitation"`) in AG-UI shared state:

```typescript
interface DeepCitationAgUIState {
  /** Aggregate citations across all messages */
  citations: CitationRecord;           // Record<string, Citation>
  /** Aggregate verifications across all messages */
  verifications: VerificationRecord;   // Record<string, Verification>
  /** Per-message tracking */
  messages: Record<string, MessageCitationState>;
}

interface MessageCitationState {
  messageId: string;
  citations: CitationRecord;
  verifications: VerificationRecord;
  summary: {
    total: number;
    verified: number;
    partial: number;
    missed: number;
    pending: number;
  };
  status: "streaming" | "extracting" | "verifying" | "complete" | "error";
  error?: string;
}
```

State updates use JSON Patch (RFC 6902) via `STATE_DELTA` events:

```typescript
// After citation extraction:
{ op: "replace", path: "/deepcitation/messages/<msgId>/citations", value: citationRecord }
{ op: "replace", path: "/deepcitation/messages/<msgId>/status", value: "verifying" }

// As each verification resolves:
{ op: "add", path: "/deepcitation/messages/<msgId>/verifications/<key>", value: verification }

// When all done:
{ op: "replace", path: "/deepcitation/messages/<msgId>/status", value: "complete" }
```

## Event Flow Mapping

| AG-UI Event | Middleware Action | Output |
|---|---|---|
| `TEXT_MESSAGE_START` | `accumulator.start(messageId)` | `STATE_DELTA`: init message state, status=`"streaming"` |
| `TEXT_MESSAGE_CONTENT` | `accumulator.append(messageId, delta)` | Pass through only (no extra events) |
| `TEXT_MESSAGE_END` | `flush() → getAllCitationsFromLlmOutput()` | `STATE_DELTA`: citations extracted, status=`"verifying"` |
| *(async)* | `DeepCitation.verify(llmOutput, citations)` | `STATE_DELTA` per citation: verification result + updated summary |
| *(all verified)* | — | `STATE_DELTA`: status=`"complete"` |

### Key DeepCitation Functions Used

```typescript
// Synchronous — extract citations from complete LLM text
getAllCitationsFromLlmOutput(llmOutput: unknown): CitationRecord

// Async — verify citations against attachments
DeepCitation.verify(input: VerifyInput, citations?: CitationRecord): Promise<{ verifications: VerificationRecord }>

// Synchronous — derive status flags from verification result
getCitationStatus(verification: Verification | null | undefined): CitationStatus
// Returns: { isVerified, isMiss, isPartialMatch, isPending }
```

All `Record` types are objects keyed by 16-character deterministic hashes, not arrays.

## Module Structure

New sub-package at `src/agui/`:

```
src/agui/
  index.ts                      # Public API exports
  types.ts                      # DeepCitationAgUIState, config types
  DeepCitationMiddleware.ts     # AG-UI middleware factory (core logic)
  textAccumulator.ts            # Stream text buffering utility
  statePatches.ts               # JSON Patch generation helpers
  useDeepCitationAgUI.ts        # React hook for consuming AG-UI state
```

### File Responsibilities

**`types.ts`** — All type definitions. Imports from canonical DeepCitation locations (`src/types/citation.ts`, `src/types/verification.ts`). Exports config interface and initial state constant.

**`textAccumulator.ts`** — Accumulates `TEXT_MESSAGE_CONTENT` deltas per message ID using `string[]` (joined on flush to avoid O(n²) concatenation). Enforces max buffer size (default 1MB) to prevent memory exhaustion.

**`statePatches.ts`** — Generates RFC 6902 JSON Patch operations. Uses `isSafeKey()` from `src/utils/objectSafety.ts` to prevent prototype pollution in path segments. Helper functions: `safePath()`, `citationPatches()`, `verificationPatch()`, `summaryPatches()`, `statusPatch()`.

**`DeepCitationMiddleware.ts`** — Factory function `createDeepCitationMiddleware(config)` that returns an AG-UI middleware. Intercepts `TEXT_MESSAGE_*` events, passes them through unchanged, accumulates text, extracts citations on `TEXT_MESSAGE_END`, then asynchronously verifies and emits `STATE_DELTA` events. The outer Observable does not complete until both the inner stream and async verification finish.

**`useDeepCitationAgUI.ts`** — React hook that extracts DeepCitation state from AG-UI shared state and returns `{ citations, verifications, status, summary }` for a given message ID. Compatible with existing `CitationComponent` props.

**`index.ts`** — Public API. Exports `createDeepCitationMiddleware`, `useDeepCitationAgUI`, types (type-only re-exports per CLAUDE.md rules), and `INITIAL_DEEPCITATION_STATE`.

## Build & Package Changes

### `tsup.config.ts`
Add entry:
```typescript
"agui/index": "src/agui/index.ts",
```

Add to `external` array:
```typescript
external: ["react", "react-dom", "@radix-ui/react-popover", "@ag-ui/core", "rxjs"],
```

### `package.json`

Add export:
```json
"./agui": {
  "types": "./lib/agui/index.d.ts",
  "import": "./lib/agui/index.js",
  "require": "./lib/agui/index.cjs",
  "default": "./lib/agui/index.js"
}
```

Add to `typesVersions`:
```json
"agui": ["./lib/agui/index.d.ts"]
```

Add peer dependency (optional):
```json
"peerDependencies": {
  "@ag-ui/client": ">=0.1.0"
}
"peerDependenciesMeta": {
  "@ag-ui/client": { "optional": true }
}
```

Add dev dependencies:
```json
"@ag-ui/core": "^0.0.30",
"@ag-ui/client": "^0.1.0",
"rxjs": "^7.8.0"
```

Add size limit:
```json
{ "path": "lib/agui/index.js", "limit": "5 KB" }
```

## Consumer Usage

### Middleware Setup

```typescript
import { HttpAgent } from "@ag-ui/client";
import { createDeepCitationMiddleware } from "deepcitation/agui";

const agent = new HttpAgent({ url: "/api/agent" });
agent.use(createDeepCitationMiddleware({
  apiKey: "sk-dc-...",
  verifyOptions: { outputImageFormat: "avif", generateProofUrls: true },
}));
```

### React Integration

```tsx
import { useDeepCitationAgUI } from "deepcitation/agui";
import { CitationComponent } from "deepcitation/react";

function ChatMessage({ message, agUiState }) {
  const { citations, verifications, status } = useDeepCitationAgUI({
    agUiState,
    messageId: message.id,
  });

  return (
    <div>
      {message.text}
      {Object.entries(citations).map(([key, citation]) => (
        <CitationComponent
          key={key}
          citation={citation}
          verification={verifications[key]}
          isLoading={status === "verifying"}
          variant="superscript"
        />
      ))}
    </div>
  );
}
```

No modifications to existing React components are needed. The hook bridges AG-UI state to the existing prop interface.

## Security Considerations

1. **Path injection**: `safePath()` validates all segments with `isSafeKey()` from `src/utils/objectSafety.ts` — rejects `__proto__`, `constructor`, `prototype`
2. **Buffer limits**: `TextAccumulator` enforces max size (1MB default) — rejects further `append()` calls beyond limit
3. **Citation key validation**: All keys used as JSON Patch paths validated with `isSafeKey()`
4. **Log safety**: Any logging uses `sanitizeForLog()` from `src/utils/logSafety.ts`
5. **State isolation**: Middleware writes only under its own key (default `"deepcitation"`) — never touches other AG-UI state

## Phased Delivery

### Phase 1 — MVP (this design)
- `createDeepCitationMiddleware()` factory
- `useDeepCitationAgUI()` React hook
- Types, text accumulator, JSON Patch helpers
- Unit tests (mock observables, no real AG-UI server)
- README documentation

### Phase 2 — Enhanced Events
- `CUSTOM` events for fine-grained lifecycle (citation seen, evidence ready) — parallels existing `CitationTimingEvent`
- Incremental citation detection during streaming (detect `[N]` markers in `TEXT_MESSAGE_CONTENT`)
- Example app with CopilotKit + AG-UI + DeepCitation

### Phase 3 — Advanced
- Bidirectional: frontend review events (popover open/close) sent back via AG-UI state
- Pre-warm verification before stream completes
- State eviction for long conversations (keep last N messages)
- `AbstractAgent` subclass for agent-side integration

## Implementation Sequence

When Phase 1 is implemented:

1. `src/agui/types.ts` — type definitions
2. `src/agui/textAccumulator.ts` — stream buffer
3. `src/agui/statePatches.ts` — JSON Patch helpers
4. `src/agui/DeepCitationMiddleware.ts` — middleware factory
5. `src/agui/useDeepCitationAgUI.ts` — React hook
6. `src/agui/index.ts` — public API
7. `tsup.config.ts` — add entry + externals
8. `package.json` — exports, peer deps, size limit
9. `CLAUDE.md` — add canonical locations for new symbols
10. Tests in `src/__tests__/agui/`

## Known Challenges

1. **RxJS dependency**: DeepCitation has zero runtime dependencies. The middleware uses RxJS Observable via the `@ag-ui/client` peer dependency — not as a direct dep.
2. **Async after stream end**: Verification results arrive after the inner Observable has emitted all events. The outer Observable must not complete until async verification finishes.
3. **State size growth**: For long conversations, the `messages` record grows. Phase 2 should add optional eviction.
4. **Testing**: Tests use mock RxJS observables (`of()`, `Subject`) to create synthetic event streams — no real AG-UI server needed.
