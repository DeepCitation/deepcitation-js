import { describe, expect, it, jest } from "@jest/globals";
import {
  generateCitationKey,
  generateCitationInstanceId,
  getCitationDisplayText,
  getCitationValueText,
  classNames,
  CITATION_X_PADDING,
  CITATION_Y_PADDING,
} from "../react/utils.js";
import type { Citation } from "../types/citation.js";

describe("react utils", () => {
  const citation: Citation = {
    fileId: "file-1",
    pageNumber: 4,
    fullPhrase: "Hello",
    value: "$10",
    citationNumber: 2,
    lineIds: [1, 2],
  };

  it("generates deterministic keys", () => {
    const key = generateCitationKey(citation);
    expect(key).toHaveLength(16);
    expect(generateCitationKey({ ...citation, value: "$11" })).not.toBe(key);
  });

  it("creates unique instance ids with a random suffix", () => {
    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.123456789);
    const key = "key-123";
    const expectedSuffix = (0.123456789).toString(36).substr(2, 9);
    expect(generateCitationInstanceId(key)).toBe(`${key}-${expectedSuffix}`);
    randomSpy.mockRestore();
  });

  it("returns display and value text based on merge option", () => {
    expect(getCitationDisplayText(citation)).toBe("2");
    expect(getCitationDisplayText(citation, { displayCitationValue: true })).toBe("$10");
    expect(getCitationDisplayText({ ...citation, value: null }, { displayCitationValue: true })).toBe("2");
    expect(getCitationValueText(citation)).toBe("$10");
    expect(getCitationValueText(citation, { displayCitationValue: true })).toBe("");
  });

  it("joins class names safely", () => {
    expect(classNames("a", false, null, "b")).toBe("a b");
  });

  it("exposes default padding constants", () => {
    expect(CITATION_X_PADDING).toBe(4);
    expect(CITATION_Y_PADDING).toBe(1);
  });
});
