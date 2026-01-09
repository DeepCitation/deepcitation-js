import { describe, expect, it } from "@jest/globals";
import {
  BLANK_HIGHLIGHT_LOCATION,
  NOT_FOUND_HIGHLIGHT_INDEX,
  PENDING_HIGHLIGHT_INDEX,
  deterministicIdFromHighlightLocation,
} from "../types/foundHighlight.js";

describe("foundHighlight helpers", () => {
  it("exposes sentinel constants and blank defaults", () => {
    expect(NOT_FOUND_HIGHLIGHT_INDEX).toBe(-1);
    expect(PENDING_HIGHLIGHT_INDEX).toBe(-2);
    expect(BLANK_HIGHLIGHT_LOCATION.pageNumber).toBe(NOT_FOUND_HIGHLIGHT_INDEX);
    expect(BLANK_HIGHLIGHT_LOCATION.citation?.pageNumber).toBe(NOT_FOUND_HIGHLIGHT_INDEX);
  });

  it("builds deterministic ids from highlight attributes", () => {
    const highlight = {
      lowerCaseSearchTerm: "phrase",
      attachmentId: "file-1",
      pageNumber: 3,
      hitIndexWithinPage: 2,
      matchSnippet: "snippet",
    };
    const first = deterministicIdFromHighlightLocation(highlight);
    const second = deterministicIdFromHighlightLocation(highlight);
    expect(first).toBe(second);
  });
});
