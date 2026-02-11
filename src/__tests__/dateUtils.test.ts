import { describe, expect, it } from "@jest/globals";
import { formatCaptureDate } from "../react/dateUtils.js";

describe("formatCaptureDate", () => {
  it("returns null for null input", () => {
    expect(formatCaptureDate(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(formatCaptureDate(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(formatCaptureDate("")).toBeNull();
  });

  it("returns null for invalid date string", () => {
    expect(formatCaptureDate("not-a-date")).toBeNull();
  });

  it("formats a Date object", () => {
    const date = new Date("2026-01-15T15:42:00Z");
    const result = formatCaptureDate(date);
    expect(result).not.toBeNull();
    expect(result!.display).toMatch(/Jan\s+15/);
    expect(result!.tooltip).toBe(date.toISOString());
  });

  it("formats an ISO string", () => {
    const result = formatCaptureDate("2026-06-20T10:30:00Z");
    expect(result).not.toBeNull();
    expect(result!.display).toMatch(/Jun\s+20/);
    expect(result!.tooltip).toContain("2026-06-20");
  });

  it("includes year for different-year dates", () => {
    const result = formatCaptureDate("2024-03-10T12:00:00Z");
    expect(result).not.toBeNull();
    expect(result!.display).toMatch(/2024/);
  });

  it("omits year for same-year dates", () => {
    const now = new Date();
    const sameYear = new Date(now.getFullYear(), 5, 15, 12, 0, 0);
    const result = formatCaptureDate(sameYear);
    expect(result).not.toBeNull();
    // Should not contain the year
    expect(result!.display).not.toMatch(new RegExp(`${now.getFullYear()}`));
  });

  it("includes time when showTime is true", () => {
    const result = formatCaptureDate("2026-01-15T15:42:00Z", { showTime: true });
    expect(result).not.toBeNull();
    expect(result!.display).toMatch(/at\s+\d+:\d+/);
  });

  it("excludes time when showTime is false", () => {
    const result = formatCaptureDate("2026-01-15T15:42:00Z", { showTime: false });
    expect(result).not.toBeNull();
    expect(result!.display).not.toContain("at");
  });

  it("excludes time by default", () => {
    const result = formatCaptureDate("2026-01-15T15:42:00Z");
    expect(result).not.toBeNull();
    expect(result!.display).not.toContain("at");
  });

  it("tooltip always contains ISO 8601 string", () => {
    const result = formatCaptureDate("2026-01-15T15:42:00Z");
    expect(result).not.toBeNull();
    expect(result!.tooltip).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
