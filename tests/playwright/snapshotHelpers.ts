import type { Page } from "@playwright/test";

/**
 * Scale down a showcase element before snapshot to reduce pixel count.
 * Uses CSS transform: scale(0.5) which halves both width and height,
 * reducing total pixels by ~75% while preserving the CSS layout.
 */
export async function scaleDownForSnapshot(page: Page, testId: string) {
  await page.addStyleTag({
    content: `[data-testid="${testId}"] { transform: scale(0.5); transform-origin: top left; }`,
  });
}
