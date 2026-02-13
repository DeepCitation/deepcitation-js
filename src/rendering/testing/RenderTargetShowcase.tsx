import type React from "react";
import { GitHubPreview } from "./GitHubPreview.js";
import { HtmlPreview } from "./HtmlPreview.js";
import { SlackPreview } from "./SlackPreview.js";
import { TerminalPreview } from "./TerminalPreview.js";

// =============================================================================
// SHOWCASE HELPER COMPONENTS
// =============================================================================

interface ShowcaseSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  "data-testid"?: string;
}

function ShowcaseSection({ title, description, children, "data-testid": testId }: ShowcaseSectionProps) {
  return (
    <section className="mb-4" data-testid={testId}>
      <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-200">{title}</h2>
      {description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{description}</p>}
      {children}
    </section>
  );
}

// =============================================================================
// RENDER TARGET SHOWCASE
// =============================================================================

export function RenderTargetShowcase() {
  return (
    <div className="p-3 bg-white dark:bg-gray-900" data-testid="render-target-showcase">
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">Render Target Visual Showcase</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Visual reference for Slack, GitHub, HTML, and Terminal render targets
      </p>

      <ShowcaseSection
        title="1. Slack mrkdwn"
        description="Slack bot messages with mrkdwn formatting. Links use <url|text> syntax. No inline images — relies on Slack unfurl."
        data-testid="slack-section"
      >
        <SlackPreview />
      </ShowcaseSection>

      <ShowcaseSection
        title="2. GitHub Markdown"
        description="PR comments and issues using GitHub-flavored Markdown. Supports <details>, inline HTML, and hosted image URLs."
        data-testid="github-section"
      >
        <GitHubPreview />
      </ShowcaseSection>

      <ShowcaseSection
        title="3. HTML (Static)"
        description="Self-contained HTML for email digests, static reports, and Notion paste. CSS-only interactivity, no JavaScript required."
        data-testid="html-section"
      >
        <HtmlPreview />
      </ShowcaseSection>

      <ShowcaseSection
        title="4. Terminal / CLI"
        description="ANSI-colored output for CLI tools, logs, and developer tooling. Box-drawing characters for structure. No images."
        data-testid="terminal-section"
      >
        <TerminalPreview />
      </ShowcaseSection>
    </div>
  );
}
