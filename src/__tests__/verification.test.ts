import { describe, expect, it } from "@jest/globals";
import { generateVerificationKey } from "../react/utils.js";
import type { Verification } from "../types/verification.js";

describe("verification helpers", () => {
  it("builds deterministic ids from verification attributes", () => {
    const verification: Verification = {
      label: "phrase",
      attachmentId: "file-1",
      document: {
        verifiedPageNumber: 3,
        hitIndexWithinPage: 2,
      },
      verifiedMatchSnippet: "snippet",
    };
    const first = generateVerificationKey(verification);
    const second = generateVerificationKey(verification);
    expect(first).toBe(second);
  });
});
