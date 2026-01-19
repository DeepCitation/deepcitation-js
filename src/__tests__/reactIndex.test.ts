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
  // Sources list components and utilities
  SourcesListComponent,
  SourcesListItem,
  SourcesTrigger,
  sourceCitationsToListItems,
  useSourcesList,
  detectSourceType,
  getPlatformName,
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

  it("exports SourcesList components", () => {
    expect(SourcesListComponent).toBeDefined();
    expect(SourcesListItem).toBeDefined();
    expect(SourcesTrigger).toBeDefined();
  });

  it("exports SourcesList utilities", () => {
    expect(typeof sourceCitationsToListItems).toBe("function");
    expect(typeof useSourcesList).toBe("function");
    expect(typeof detectSourceType).toBe("function");
    expect(typeof getPlatformName).toBe("function");
  });

  it("detectSourceType categorizes URLs correctly", () => {
    expect(detectSourceType("https://github.com/repo")).toBe("code");
    expect(detectSourceType("https://youtube.com/watch")).toBe("video");
    expect(detectSourceType("https://twitter.com/user")).toBe("social");
  });

  it("getPlatformName returns human-readable names", () => {
    expect(getPlatformName("https://github.com/repo")).toBe("GitHub");
    expect(getPlatformName("https://x.com/user")).toBe("X");
  });

  it("sourceCitationsToListItems converts citations", () => {
    const citations = [
      { url: "https://example.com/page", title: "Example", citationNumber: 1 },
    ];
    const items = sourceCitationsToListItems(citations);
    expect(items).toHaveLength(1);
    expect(items[0].url).toBe("https://example.com/page");
  });
});
