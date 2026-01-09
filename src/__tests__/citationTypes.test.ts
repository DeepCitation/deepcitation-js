import { describe, expect, it } from "@jest/globals";
import { VERIFICATION_VERSION_NUMBER } from "../types/citation.js";

describe("citation types", () => {
  it("exposes a semantic verification version", () => {
    expect(VERIFICATION_VERSION_NUMBER).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
