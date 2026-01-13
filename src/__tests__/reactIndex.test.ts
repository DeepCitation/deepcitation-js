import { describe, expect, it } from "@jest/globals";
import {
  // Utilities
  generateCitationKey,
  generateCitationInstanceId,
  getCitationDisplayText,
  getCitationKeySpanText,
  classNames,
  CITATION_X_PADDING,
  CITATION_Y_PADDING,
  // URL utilities
  extractDomain,
  isBlockedStatus,
  isErrorStatus,
  isVerifiedStatus,
} from "../react/index.js";

describe("react index exports", () => {
  it("exports utility functions", () => {
    expect(typeof generateCitationKey).toBe("function");
    expect(typeof generateCitationInstanceId).toBe("function");
    expect(typeof getCitationDisplayText).toBe("function");
    expect(typeof getCitationKeySpanText).toBe("function");
    expect(typeof classNames).toBe("function");
  });

  it("exports constants", () => {
    expect(CITATION_X_PADDING).toBe(4);
    expect(CITATION_Y_PADDING).toBe(1);
  });

  it("exports URL utilities", () => {
    expect(typeof extractDomain).toBe("function");
    expect(typeof isBlockedStatus).toBe("function");
    expect(typeof isErrorStatus).toBe("function");
    expect(typeof isVerifiedStatus).toBe("function");
  });
});
