import { describe, expect, it } from "@jest/globals";
import {
  normalizeCitations,
  parseCitation,
  sha1Hash,
  CITATION_MARKDOWN_SYNTAX_PROMPT,
  CITATION_X_PADDING,
  CITATION_Y_PADDING,
} from "../index.js";

describe("index exports", () => {
  it("re-exports core helpers and constants", () => {
    expect(typeof normalizeCitations).toBe("function");
    expect(typeof parseCitation).toBe("function");
    expect(typeof sha1Hash).toBe("function");
    expect(typeof CITATION_MARKDOWN_SYNTAX_PROMPT).toBe("string");
    expect(typeof CITATION_X_PADDING).toBe("number");
    expect(typeof CITATION_Y_PADDING).toBe("number");
  });
});
