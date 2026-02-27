import { afterEach, describe, expect, it } from "@jest/globals";
import { cleanup, render } from "@testing-library/react";
import { EvidenceTray } from "../react/EvidenceTray";
import type { CitationStatus } from "../types/citation";
import type { Verification } from "../types/verification";

const baseStatus: CitationStatus = {
  isVerified: true,
  isMiss: false,
  isPartialMatch: false,
  isPending: false,
};

const baseVerification: Verification = {
  status: "found",
  document: {
    verificationImageSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
  },
};

describe("EvidenceTray interaction styles", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders static muted helper hint for interactive trays", () => {
    const { getByText } = render(
      <EvidenceTray verification={baseVerification} status={baseStatus} onExpand={() => {}} />,
    );

    const hint = getByText("· Click to expand");
    expect(hint.className).toContain("font-medium");
    expect(hint.className).toContain("text-gray-400");
  });

  it("renders tertiary View page action with blue hover and focus ring styles", () => {
    const { getByRole } = render(
      <EvidenceTray verification={baseVerification} status={baseStatus} onExpand={() => {}} />,
    );

    const viewPageButton = getByRole("button", { name: /view page/i });
    expect(viewPageButton.className).toContain("text-gray-600");
    expect(viewPageButton.className).toContain("hover:text-blue-600");
    expect(viewPageButton.className).toContain("focus-visible:ring-2");
  });
});
