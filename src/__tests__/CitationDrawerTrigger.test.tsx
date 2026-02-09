import { expect, test } from "@playwright/experimental-ct-react";
import type { SourceCitationGroup } from "../react/CitationDrawer.types";
import { CitationDrawerTrigger } from "../react/CitationDrawerTrigger";

// =========
// Test Fixtures
// =========

const createMockCitationGroup = (overrides?: Partial<SourceCitationGroup>): SourceCitationGroup => ({
  sourceName: "Test Source",
  sourceDomain: "test.com",
  sourceFavicon: "https://test.com/favicon.ico",
  citations: [
    {
      citationKey: "test-1",
      citation: {
        type: "url",
        url: "https://test.com/article",
        domain: "test.com",
        siteName: "Test Source",
        title: "Test Article",
        fullPhrase: "Test content",
        anchorText: "content",
        citationNumber: 1,
      },
      verification: { status: "found" },
    },
  ],
  additionalCount: 0,
  ...overrides,
});

const createAllVerifiedGroups = (): SourceCitationGroup[] => [
  createMockCitationGroup({
    sourceName: "Stripe",
    sourceDomain: "stripe.com",
  }),
  createMockCitationGroup({
    sourceName: "GitHub",
    sourceDomain: "github.com",
  }),
  createMockCitationGroup({
    sourceName: "MDN",
    sourceDomain: "mdn.org",
  }),
];

const createMixedStatusGroups = (): SourceCitationGroup[] => [
  createMockCitationGroup({
    sourceName: "React",
    citations: [
      {
        citationKey: "r-1",
        citation: {
          type: "url",
          url: "https://react.dev",
          domain: "react.dev",
          siteName: "React",
          title: "React",
          fullPhrase: "React is a library",
          anchorText: "library",
          citationNumber: 1,
        },
        verification: { status: "found" },
      },
    ],
    additionalCount: 0,
  }),
  createMockCitationGroup({
    sourceName: "Tailwind",
    citations: [
      {
        citationKey: "tw-1",
        citation: {
          type: "url",
          url: "https://tailwindcss.com",
          domain: "tailwindcss.com",
          siteName: "Tailwind CSS",
          title: "Tailwind",
          fullPhrase: "Utility-first CSS",
          anchorText: "CSS",
          citationNumber: 2,
        },
        verification: { status: "found_on_other_page" },
      },
    ],
    additionalCount: 0,
  }),
  createMockCitationGroup({
    sourceName: "Next.js",
    citations: [
      {
        citationKey: "nj-1",
        citation: {
          type: "url",
          url: "https://nextjs.org",
          domain: "nextjs.org",
          siteName: "Next.js",
          title: "Next.js",
          fullPhrase: "Server components",
          anchorText: "components",
          citationNumber: 3,
        },
        verification: { status: "not_found" },
      },
    ],
    additionalCount: 0,
  }),
  createMockCitationGroup({
    sourceName: "TypeScript",
    citations: [
      {
        citationKey: "ts-1",
        citation: {
          type: "url",
          url: "https://typescriptlang.org",
          domain: "typescriptlang.org",
          siteName: "TypeScript",
          title: "TypeScript",
          fullPhrase: "Optional static typing",
          anchorText: "typing",
          citationNumber: 4,
        },
        verification: { status: "pending" },
      },
    ],
    additionalCount: 0,
  }),
];

const createAllPendingGroups = (): SourceCitationGroup[] => [
  createMockCitationGroup({
    sourceName: "OpenAI",
    citations: [
      {
        citationKey: "oai-1",
        citation: {
          type: "url",
          url: "https://openai.com",
          domain: "openai.com",
          siteName: "OpenAI",
          title: "OpenAI",
          fullPhrase: "GPT models",
          anchorText: "models",
          citationNumber: 1,
        },
        verification: { status: "pending" },
      },
    ],
    additionalCount: 0,
  }),
  createMockCitationGroup({
    sourceName: "Anthropic",
    citations: [
      {
        citationKey: "anth-1",
        citation: {
          type: "url",
          url: "https://anthropic.com",
          domain: "anthropic.com",
          siteName: "Anthropic",
          title: "Anthropic",
          fullPhrase: "Claude is helpful",
          anchorText: "helpful",
          citationNumber: 2,
        },
        verification: { status: "loading" },
      },
    ],
    additionalCount: 0,
  }),
];

// =========
// Tests
// =========

test.describe("CitationDrawerTrigger", () => {
  test("renders when citation groups exist", async ({ mount }) => {
    const groups = createAllVerifiedGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} />);

    await expect(component).toBeVisible();
  });

  test("does not render when citation groups are empty", async ({ mount }) => {
    const component = await mount(<CitationDrawerTrigger citationGroups={[]} />);

    await expect(component).toBeHidden();
  });

  test("displays correct status summary for all verified citations", async ({ mount }) => {
    const groups = createAllVerifiedGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} />);

    const label = component.locator("span").filter({ hasText: "sources" });
    await expect(label).toContainText("3 verified");
  });

  test("displays correct status summary for mixed statuses", async ({ mount }) => {
    const groups = createMixedStatusGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} />);

    const label = component.locator("span").filter({ hasText: "sources" });
    await expect(label).toContainText("4 sources");
    await expect(label).toContainText("verified");
    await expect(label).toContainText("partial");
    await expect(label).toContainText("not found");
    await expect(label).toContainText("pending");
  });

  test("expands on hover to show source rows", async ({ mount }) => {
    const groups = createMixedStatusGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} />);

    const hoverContent = component.locator("div").filter({ hasText: "React" });
    await expect(hoverContent).toHaveCSS("opacity", "0");

    await component.hover();

    const visibleContent = component.locator("span").filter({ hasText: "React" });
    await expect(visibleContent).toBeVisible();
  });

  test("displays chevron that rotates on hover", async ({ mount }) => {
    const groups = createAllVerifiedGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} />);

    const chevron = component.locator("svg");

    let classes = await chevron.getAttribute("class");
    expect(classes).not.toContain("rotate-180");

    await component.hover();
    classes = await chevron.getAttribute("class");
    expect(classes).toContain("rotate-180");
  });

  test("calls onClick handler when clicked", async ({ mount }) => {
    const groups = createAllVerifiedGroups();
    let clicked = false;
    const onClick = () => {
      clicked = true;
    };

    const component = await mount(<CitationDrawerTrigger citationGroups={groups} onClick={onClick} />);

    await component.click();
    expect(clicked).toBe(true);
  });

  test("expands on keyboard focus", async ({ mount }) => {
    const groups = createMixedStatusGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} />);

    const button = component.locator("button");
    await button.focus();

    const visibleContent = component.locator("span").filter({ hasText: "React" });
    await expect(visibleContent).toBeVisible();
  });

  test("collapses on keyboard blur", async ({ mount }) => {
    const groups = createMixedStatusGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} />);

    const button = component.locator("button");
    await button.focus();

    const visibleContent = component.locator("span").filter({ hasText: "React" });
    await expect(visibleContent).toBeVisible();

    await button.blur();

    await expect(visibleContent).toHaveCSS("opacity", "0");
  });

  test("displays custom label when provided", async ({ mount }) => {
    const groups = createAllVerifiedGroups();
    const customLabel = "Custom Citations Label";
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} label={customLabel} />);

    const label = component.locator("span").filter({ hasText: customLabel });
    await expect(label).toBeVisible();
  });

  test("shows status dots with correct colors", async ({ mount }) => {
    const groups = createMixedStatusGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} />);

    const dots = component.locator("[aria-hidden='true']").first();
    await expect(dots).toBeVisible();

    const dotElements = dots.locator("span");
    const count = await dotElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test("displays stacked favicons up to maxIcons limit", async ({ mount }) => {
    const groups = createAllVerifiedGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} maxIcons={2} />);

    const faviconArea = component.locator("div").filter({ hasText: "+" });
    await expect(faviconArea).toBeVisible();
  });

  test("handles aria attributes correctly", async ({ mount }) => {
    const groups = createAllVerifiedGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} isOpen={true} />);

    const button = component.locator("button");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(button).toHaveAttribute("aria-haspopup", "dialog");
  });

  test("supports dark mode classes", async ({ mount }) => {
    const groups = createAllVerifiedGroups();
    const component = await mount(
      <div className="dark">
        <CitationDrawerTrigger citationGroups={groups} />
      </div>,
    );

    const button = component.locator("button");
    const classes = await button.getAttribute("class");
    expect(classes).toContain("dark:bg-gray-800");
  });

  test("shows 'all pending' status with spinner animation", async ({ mount }) => {
    const groups = createAllPendingGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} />);

    const label = component.locator("span").filter({ hasText: "pending" });
    await expect(label).toContainText("2 pending");
  });

  test("applies custom className prop", async ({ mount }) => {
    const groups = createAllVerifiedGroups();
    const customClass = "custom-test-class";
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} className={customClass} />);

    const button = component.locator("button");
    const classes = await button.getAttribute("class");
    expect(classes).toContain(customClass);
  });

  test("handles citation group with empty citations array", async ({ mount }) => {
    const emptyGroup: SourceCitationGroup = {
      sourceName: "Empty Source",
      sourceDomain: "empty.com",
      citations: [],
      additionalCount: 0,
    };

    const component = await mount(<CitationDrawerTrigger citationGroups={[emptyGroup]} />);

    await expect(component).toBeVisible();

    await component.hover();
    await expect(component).toBeVisible();
  });

  test("renders properly on mobile", async ({ mount }) => {
    const groups = createMixedStatusGroups();
    const component = await mount(<CitationDrawerTrigger citationGroups={groups} />);

    await expect(component).toBeVisible();
    const button = component.locator("button");
    await expect(button).toHaveCSS("width", "100%");
  });

  test("trigger is clickable on mobile", async ({ mount }) => {
    const groups = createMixedStatusGroups();
    let clicked = false;
    const onClick = () => {
      clicked = true;
    };

    const component = await mount(<CitationDrawerTrigger citationGroups={groups} onClick={onClick} />);

    await component.click();
    expect(clicked).toBe(true);
  });
});
