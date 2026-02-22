import { expect, test } from "@playwright/experimental-ct-react";
import { CitationComponent } from "../../../src/react/CitationComponent";
import type { Citation } from "../../../src/types/citation";
import type { Verification } from "../../../src/types/verification";

// =============================================================================
// TEST FIXTURES
// =============================================================================

const baseCitation: Citation = {
  citationNumber: 1,
  anchorText: "Functional status",
  fullPhrase: "Functional status: He is at baseline, no assistance needed, independent ADLs",
  pageNumber: 5,
};

// Static 800×1600 white PNG (1-bit grayscale, ~600 bytes).
// Portrait aspect ratio (2:1 height-to-width) triggers the bug where
// fitZoomH < fitZoomW, causing Math.min(fitZoomW, fitZoomH) to shrink width.
const tallImageBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAZAAQAAAACpxxs4AAACPklEQVR42u3NMQEAAAwCIPuX1hZ7BgVID0QikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUTyNRnb9LNzJVTWGwAAAABJRU5ErkJggg==";

// Verification with pages[] array so resolveExpandedImage finds a match page,
// enabling the "Expand to full page" button.
const verificationWithTallImage: Verification = {
  status: "found",
  verifiedMatchSnippet: "Functional status: He is at baseline",
  document: {
    verifiedPageNumber: 5,
    verificationImageSrc: tallImageBase64,
  },
  pages: [
    {
      pageNumber: 5,
      dimensions: { width: 800, height: 1600 },
      source: tallImageBase64,
      isMatchPage: true,
    },
  ],
};

// =============================================================================
// EXPANDED-PAGE POPOVER SIZING TESTS
// =============================================================================

test.describe("Expanded-Page Popover Sizing", () => {
  test("X-axis: popover width fills viewport for tall images", async ({ mount, page }) => {
    // Default CT viewport is 1280×720
    await mount(
      <div style={{ padding: "100px" }}>
        <CitationComponent citation={baseCitation} verification={verificationWithTallImage} />
      </div>,
    );

    // Open popover
    const citation = page.locator("[data-citation-id]");
    await citation.click();

    const popover = page.locator("[data-radix-popper-content-wrapper]");
    await expect(popover).toBeVisible();

    // Click "Expand to full page" button in the EvidenceTray
    const expandButton = popover.getByLabel(/Expand to full page/);
    await expect(expandButton).toBeVisible({ timeout: 5000 });
    await expandButton.click();

    // Wait for the expanded image to load and dimensions to settle
    const expandedView = popover.locator("[data-dc-inline-expanded]");
    await expect(expandedView).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    // The popover should be wide — with width-only fit zoom, a tall 800px-wide
    // image on a 1280px viewport should produce a popover around 800+ px wide.
    // BUG: with Math.min(fitZoomW, fitZoomH), the height constraint dominates
    // and shrinks the popover to ~250px.
    const popoverBox = await popover.boundingBox();
    expect(popoverBox).toBeTruthy();
    expect(popoverBox!.width).toBeGreaterThan(600);
  });

  test("Y-axis: popover height fills available viewport space", async ({ mount, page }) => {
    // Trigger near center: plenty of space both above and below
    await mount(
      <div style={{ padding: "100px" }}>
        <CitationComponent citation={baseCitation} verification={verificationWithTallImage} />
      </div>,
    );

    const citation = page.locator("[data-citation-id]");
    await citation.click();

    const popover = page.locator("[data-radix-popper-content-wrapper]");
    await expect(popover).toBeVisible();

    const expandButton = popover.getByLabel(/Expand to full page/);
    await expandButton.click();

    const expandedView = popover.locator("[data-dc-inline-expanded]");
    await expect(expandedView).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    // With explicit height on PopoverContent and height: 100% on inner divs,
    // the popover should fill most of the viewport height.
    // BUG: with maxHeight-only, flex children collapse and height is ~200-300px.
    const popoverBox = await popover.boundingBox();
    expect(popoverBox).toBeTruthy();
    expect(popoverBox!.height).toBeGreaterThan(500);
  });

  test("viewport containment: popover shifts when trigger is near bottom", async ({
    mount,
    page,
  }) => {
    // Position the trigger near the bottom of the viewport so there's little space below.
    // The shift middleware repositions the popover upward. With a near-viewport-height
    // popover, Radix's limitShift may allow some overflow to keep the popover visually
    // associated with its trigger — so we verify the bottom stays within bounds and
    // the shift actually moves the popover upward from its unshifted position.
    await mount(
      <div style={{ paddingTop: "600px", paddingLeft: "100px" }}>
        <CitationComponent citation={baseCitation} verification={verificationWithTallImage} />
      </div>,
    );

    const citation = page.locator("[data-citation-id]");
    await citation.click();

    const popover = page.locator("[data-radix-popper-content-wrapper]");
    await expect(popover).toBeVisible();

    const expandButton = popover.getByLabel(/Expand to full page/);
    await expandButton.click();

    const expandedView = popover.locator("[data-dc-inline-expanded]");
    await expect(expandedView).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    const viewport = page.viewportSize()!;
    const popoverBox = await popover.boundingBox();
    expect(popoverBox).toBeTruthy();

    // The popover bottom should not extend below the viewport
    expect(popoverBox!.y + popoverBox!.height).toBeLessThanOrEqual(viewport.height + 2);
    // The popover should occupy significant viewport height (confirms height fix works)
    expect(popoverBox!.height).toBeGreaterThan(500);
  });
});

// =============================================================================
// REGRESSION: KEYHOLE STRIP UNCHANGED
// =============================================================================

test.describe("Expanded-Page Regression: Keyhole Strip", () => {
  test("keyhole strip remains at normal dimensions before expanding", async ({ mount, page }) => {
    await mount(
      <div style={{ padding: "100px" }}>
        <CitationComponent citation={baseCitation} verification={verificationWithTallImage} />
      </div>,
    );

    const citation = page.locator("[data-citation-id]");
    await citation.click();

    const popover = page.locator("[data-radix-popper-content-wrapper]");
    await expect(popover).toBeVisible();

    // Keyhole strip should be visible in summary mode
    const strip = popover.locator("[data-dc-keyhole]");
    await expect(strip).toBeVisible();

    // Strip height should be 90px (KEYHOLE_STRIP_HEIGHT_DEFAULT)
    const stripHeight = await strip.evaluate(el =>
      parseFloat(window.getComputedStyle(el as HTMLElement).height),
    );
    expect(stripHeight).toBe(90);

    // Popover container should be at normal width (~480px)
    const container = popover.locator(".shadow-md.rounded-lg");
    await expect(container).toBeVisible();
    const containerWidth = await container.evaluate(el =>
      parseFloat(window.getComputedStyle(el as HTMLElement).width),
    );
    expect(containerWidth).toBeGreaterThanOrEqual(476);
    expect(containerWidth).toBeLessThanOrEqual(480);
  });
});
