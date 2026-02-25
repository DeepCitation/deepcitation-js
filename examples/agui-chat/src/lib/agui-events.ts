/**
 * AG-UI Event Builder Helpers
 *
 * Thin builder functions that produce AG-UI protocol event objects.
 * Used by the /api/agent route handler for readability.
 */

import { EventType, type BaseEvent } from "@ag-ui/core";

export function runStarted(threadId: string, runId: string): BaseEvent {
  return { type: EventType.RUN_STARTED, threadId, runId } as BaseEvent;
}

export function textMessageStart(messageId: string): BaseEvent {
  return {
    type: EventType.TEXT_MESSAGE_START,
    messageId,
    role: "assistant",
  } as BaseEvent;
}

export function textMessageContent(messageId: string, delta: string): BaseEvent {
  return { type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta } as BaseEvent;
}

export function textMessageEnd(messageId: string): BaseEvent {
  return { type: EventType.TEXT_MESSAGE_END, messageId } as BaseEvent;
}

export function stateSnapshot(snapshot: Record<string, unknown>): BaseEvent {
  return { type: EventType.STATE_SNAPSHOT, snapshot } as BaseEvent;
}

export function stateDelta(
  delta: Array<{ op: string; path: string; value: unknown }>,
): BaseEvent {
  return { type: EventType.STATE_DELTA, delta } as BaseEvent;
}

export function runFinished(threadId: string, runId: string): BaseEvent {
  return { type: EventType.RUN_FINISHED, threadId, runId } as BaseEvent;
}

export function runError(message: string): BaseEvent {
  return { type: EventType.RUN_ERROR, message } as BaseEvent;
}
