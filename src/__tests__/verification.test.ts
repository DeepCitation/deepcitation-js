import { describe, expect, it } from "@jest/globals";
import { generateVerificationKey } from "../react/utils.js";
import {
  BLANK_VERIFICATION,
  type Verification,
} from "../types/verification.js";

describe("verification helpers", () => {
  it("BLANK_VERIFICATION is a frozen not_found sentinel", () => {
    expect(BLANK_VERIFICATION.status).toBe("not_found");
    expect(BLANK_VERIFICATION.attachmentId).toBeNull();
    expect(Object.isFrozen(BLANK_VERIFICATION)).toBe(true);
  });

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
