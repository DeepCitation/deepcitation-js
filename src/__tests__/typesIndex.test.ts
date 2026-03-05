import { describe, expect, it } from "@jest/globals";
import { BLANK_VERIFICATION } from "../types/index.js";

describe("types index exports", () => {
  it("re-exports BLANK_VERIFICATION", () => {
    expect(BLANK_VERIFICATION.status).toBe("not_found");
    expect(Object.isFrozen(BLANK_VERIFICATION)).toBe(true);
  });
});
