import { afterEach, describe, expect, it } from "@jest/globals";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import {
  AmbiguityWarning,
  LookingForSection,
  getVariationLabel,
  type AmbiguityInfo,
} from "../react/VerificationLog";

describe("AmbiguityWarning", () => {
  afterEach(() => {
    cleanup();
  });

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe("rendering", () => {
    it("renders when totalOccurrences > 1", () => {
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 3,
        occurrencesOnExpectedPage: 1,
        confidence: "medium",
        note: "Multiple matches found",
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      expect(container.textContent).toContain("Found 3 occurrences");
    });

    it("does not render when totalOccurrences is 1", () => {
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 1,
        occurrencesOnExpectedPage: 1,
        confidence: "high",
        note: "",
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      expect(container.textContent).toBe("");
    });

    it("does not render when totalOccurrences is 0", () => {
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 0,
        occurrencesOnExpectedPage: 0,
        confidence: "low",
        note: "",
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      expect(container.textContent).toBe("");
    });

    it("displays occurrences on expected page when > 0", () => {
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 5,
        occurrencesOnExpectedPage: 2,
        confidence: "medium",
        note: "",
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      expect(container.textContent).toContain("(2 on expected page)");
    });

    it("does not show expected page count when 0", () => {
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 3,
        occurrencesOnExpectedPage: 0,
        confidence: "low",
        note: "",
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      expect(container.textContent).not.toContain("on expected page");
    });

    it("displays note when present", () => {
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 2,
        occurrencesOnExpectedPage: 1,
        confidence: "medium",
        note: "This is a test note about ambiguity",
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      expect(container.textContent).toContain("This is a test note about ambiguity");
    });

    it("truncates very long notes", () => {
      const longNote = "A".repeat(250);
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 2,
        occurrencesOnExpectedPage: 1,
        confidence: "low",
        note: longNote,
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      // Should be truncated to 200 chars + "..."
      expect(container.textContent).toContain("A".repeat(200) + "...");
      expect(container.textContent).not.toContain("A".repeat(201));
    });

    it("handles large occurrence numbers with locale formatting", () => {
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 10000,
        occurrencesOnExpectedPage: 5000,
        confidence: "low",
        note: "",
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      // Should use locale formatting (10,000 in en-US)
      expect(container.textContent).toContain("10,000");
      expect(container.textContent).toContain("5,000");
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe("accessibility", () => {
    it("has role='status' for screen readers", () => {
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 2,
        occurrencesOnExpectedPage: 1,
        confidence: "medium",
        note: "",
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      const statusElement = container.querySelector("[role='status']");
      expect(statusElement).toBeInTheDocument();
    });

    it("has aria-live='polite' for dynamic updates", () => {
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 2,
        occurrencesOnExpectedPage: 1,
        confidence: "medium",
        note: "",
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      const statusElement = container.querySelector("[aria-live='polite']");
      expect(statusElement).toBeInTheDocument();
    });

    it("has accessible warning icon", () => {
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 2,
        occurrencesOnExpectedPage: 1,
        confidence: "medium",
        note: "",
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      const svgElement = container.querySelector("svg[role='img']");
      expect(svgElement).toBeInTheDocument();
      expect(svgElement?.getAttribute("aria-label")).toBe("Warning");
    });
  });

  // ==========================================================================
  // STYLING TESTS
  // ==========================================================================

  describe("styling", () => {
    it("uses amber background styling", () => {
      const ambiguity: AmbiguityInfo = {
        totalOccurrences: 2,
        occurrencesOnExpectedPage: 1,
        confidence: "medium",
        note: "",
      };

      const { container } = render(<AmbiguityWarning ambiguity={ambiguity} />);
      const warningDiv = container.querySelector(".bg-amber-50");
      expect(warningDiv).toBeInTheDocument();
    });
  });
});

describe("LookingForSection", () => {
  afterEach(() => {
    cleanup();
  });

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe("rendering", () => {
    it("renders with anchorText only", () => {
      const { container } = render(<LookingForSection anchorText="test anchor" />);
      expect(container.textContent).toContain("Looking for");
      expect(container.textContent).toContain("test anchor");
    });

    it("renders with fullPhrase only", () => {
      const { container } = render(<LookingForSection fullPhrase="test full phrase" />);
      expect(container.textContent).toContain("Looking for");
      expect(container.textContent).toContain("test full phrase");
    });

    it("renders with both anchorText and fullPhrase", () => {
      const { container } = render(
        <LookingForSection anchorText="key phrase" fullPhrase="The key phrase is important." />
      );
      expect(container.textContent).toContain("Looking for");
      expect(container.textContent).toContain("key phrase");
      expect(container.textContent).toContain("The key phrase is important.");
    });

    it("does not render when both are empty", () => {
      const { container } = render(<LookingForSection />);
      expect(container.textContent).toBe("");
    });

    it("does not render when anchorText is empty string", () => {
      const { container } = render(<LookingForSection anchorText="" />);
      expect(container.textContent).toBe("");
    });

    it("does not render when anchorText is only whitespace", () => {
      const { container } = render(<LookingForSection anchorText="   " />);
      expect(container.textContent).toBe("");
    });

    it("handles anchorText === fullPhrase (shows only once)", () => {
      const { container } = render(
        <LookingForSection anchorText="same text" fullPhrase="same text" />
      );
      expect(container.textContent).toContain("Looking for");
      expect(container.textContent).toContain("same text");
      // Should only appear once in the rendered output (in quotes)
      const matches = container.textContent?.match(/same text/g);
      expect(matches?.length).toBe(1);
    });
  });
});

describe("getVariationLabel", () => {
  // ==========================================================================
  // VARIATION TYPE LABELS
  // ==========================================================================

  describe("known variation types", () => {
    it("returns 'Exact match' for exact", () => {
      expect(getVariationLabel("exact")).toBe("Exact match");
    });

    it("returns 'Normalized' for normalized", () => {
      expect(getVariationLabel("normalized")).toBe("Normalized");
    });

    it("returns 'Price formats' for currency", () => {
      expect(getVariationLabel("currency")).toBe("Price formats");
    });

    it("returns 'Date formats' for date", () => {
      expect(getVariationLabel("date")).toBe("Date formats");
    });

    it("returns 'Number formats' for numeric", () => {
      expect(getVariationLabel("numeric")).toBe("Number formats");
    });

    it("returns 'Symbol variants' for symbol", () => {
      expect(getVariationLabel("symbol")).toBe("Symbol variants");
    });

    it("returns 'Accent variants' for accent", () => {
      expect(getVariationLabel("accent")).toBe("Accent variants");
    });
  });

  describe("undefined handling", () => {
    it("returns null for undefined", () => {
      expect(getVariationLabel(undefined)).toBe(null);
    });
  });
});
