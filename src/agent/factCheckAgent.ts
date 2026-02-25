/**
 * DeepCitation Fact-Check Agent
 *
 * Self-contained agent that orchestrates the full fact-check workflow:
 *   1. Upload sources → get attachmentIds + deepTextPromptPortion
 *   2. Wrap prompts with citation instructions
 *   3. Call LLM (user-provided function) → get cited response
 *   4. Parse citations from LLM output
 *   5. Verify citations against sources
 *   6. Return structured report
 *
 * Modeled after examples/basic-verification and examples/url-example.
 *
 * @example
 * ```typescript
 * import { createFactCheckAgent } from "deepcitation/agent";
 *
 * const agent = createFactCheckAgent({
 *   apiKey: "sk-dc-...",
 *   llm: async (messages) => {
 *     const res = await openai.chat.completions.create({
 *       model: "gpt-5-mini",
 *       messages,
 *     });
 *     return res.choices[0].message.content ?? "";
 *   },
 * });
 *
 * const report = await agent.factCheck({
 *   content: "Verify this tax summary...",
 *   sources: [{ type: "file", file: pdfBuffer, filename: "report.pdf" }],
 * });
 * ```
 */

import { DeepCitation } from "../client/DeepCitation.js";
import type { FileDataPart } from "../client/types.js";
import { extractVisibleText } from "../parsing/citationParser.js";
import { getAllCitationsFromLlmOutput, getCitationStatus } from "../parsing/parseCitation.js";
import { wrapCitationPrompt } from "../prompts/citationPrompts.js";
import type {
  FactCheckAgentConfig,
  FactCheckCitationResult,
  FactCheckOptions,
  FactCheckReport,
  FactCheckSummary,
  LlmMessage,
} from "./types.js";

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful assistant. Answer questions about the provided documents accurately and cite your sources.";

/**
 * Creates a fact-check agent that uses the DeepCitation SDK to verify
 * LLM output against source documents.
 */
export function createFactCheckAgent(config: FactCheckAgentConfig) {
  const { apiKey, apiUrl, llm, clientConfig } = config;

  const dc = new DeepCitation({
    apiKey,
    ...(apiUrl ? { apiUrl } : {}),
    ...clientConfig,
  });

  /**
   * Run the full fact-check workflow.
   *
   * 1. Upload/prepare all sources
   * 2. Wrap system + user prompts with citation instructions
   * 3. Call the LLM with enhanced prompts
   * 4. Parse citations from the LLM response
   * 5. Verify citations against the uploaded sources
   * 6. Return a structured report
   */
  async function factCheck(options: FactCheckOptions): Promise<FactCheckReport> {
    const { content, sources, question, verificationOptions } = options;
    const systemPrompt = options.systemPrompt ?? config.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;

    // ── Step 1: Upload/prepare sources (parallel) ─────────────────────
    const fileDataParts: FileDataPart[] = await Promise.all(
      sources.map(async (source): Promise<FileDataPart> => {
        if (source.type === "prepared") {
          return source.fileDataPart;
        }
        if (source.type === "url") {
          const result = await dc.prepareUrl({ url: source.url });
          return {
            attachmentId: result.attachmentId,
            deepTextPromptPortion: result.deepTextPromptPortion,
            filename: result.metadata.filename,
          };
        }
        // source.type === "file"
        const result = await dc.uploadFile(source.file, {
          filename: source.filename,
        });
        return {
          attachmentId: result.attachmentId,
          deepTextPromptPortion: result.deepTextPromptPortion,
          filename: source.filename ?? result.metadata.filename,
        };
      }),
    );

    // ── Step 2: Wrap prompts with citation instructions ─────────────────
    const userPrompt = question
      ? `${question}\n\nContent to verify:\n${content}`
      : `Summarize and cite the key information from the provided documents.\n\nContent to verify:\n${content}`;

    const deepTextPromptPortion = fileDataParts.map(p => p.deepTextPromptPortion);

    const { enhancedSystemPrompt, enhancedUserPrompt } = wrapCitationPrompt({
      systemPrompt,
      userPrompt,
      deepTextPromptPortion,
    });

    // ── Step 3: Call LLM ────────────────────────────────────────────────
    const messages: LlmMessage[] = [
      { role: "system", content: enhancedSystemPrompt },
      { role: "user", content: enhancedUserPrompt },
    ];

    const rawLlmOutput = await llm(messages);

    // ── Step 4: Parse citations ─────────────────────────────────────────
    const citations = getAllCitationsFromLlmOutput(rawLlmOutput);
    const visibleText = extractVisibleText(rawLlmOutput);
    const citationCount = Object.keys(citations).length;

    // ── Step 5: Verify citations ────────────────────────────────────────
    if (citationCount === 0) {
      return {
        results: [],
        citations: {},
        verifications: {},
        summary: { total: 0, verified: 0, partial: 0, notFound: 0 },
        rawLlmOutput,
        visibleText,
        fileDataParts,
      };
    }

    const { verifications } = await dc.verify({
      llmOutput: rawLlmOutput,
      fileDataParts,
      ...verificationOptions,
    });

    // ── Step 6: Build report ────────────────────────────────────────────
    const results: FactCheckCitationResult[] = [];
    let verified = 0;
    let partial = 0;
    let notFound = 0;

    for (const [key, citation] of Object.entries(citations)) {
      const verification = verifications[key];
      const status = getCitationStatus(verification ?? null);

      if (status.isVerified && status.isPartialMatch) partial++;
      else if (status.isVerified) verified++;
      else if (status.isMiss) notFound++;

      results.push({ key, citation, verification, status });
    }

    const summary: FactCheckSummary = { total: citationCount, verified, partial, notFound };

    return {
      results,
      citations,
      verifications,
      summary,
      rawLlmOutput,
      visibleText,
      fileDataParts,
    };
  }

  return { factCheck };
}
