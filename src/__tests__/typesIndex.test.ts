import { describe, expect, it } from "@jest/globals";
import { VERIFICATION_VERSION_NUMBER, NOT_FOUND_HIGHLIGHT_INDEX } from "../types/index.js";

describe("types index exports", () => {
  it("re-exports citation and highlight constants", () => {
    expect(VERIFICATION_VERSION_NUMBER).toMatch(/^\d+\.\d+\.\d+$/);
    expect(NOT_FOUND_HIGHLIGHT_INDEX).toBe(-1);
  });
});
