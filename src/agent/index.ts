/**
 * DeepCitation Agent — self-contained fact-checking agent
 *
 * @example
 * ```typescript
 * import { createFactCheckAgent } from "deepcitation/agent";
 *
 * const agent = createFactCheckAgent({
 *   apiKey: process.env.DEEPCITATION_API_KEY!,
 *   llm: async (messages) => {
 *     const res = await openai.chat.completions.create({ model: "gpt-5-mini", messages });
 *     return res.choices[0].message.content ?? "";
 *   },
 * });
 *
 * const report = await agent.factCheck({
 *   content: "Revenue increased by 25% in Q4...",
 *   sources: [{ type: "file", file: pdfBuffer, filename: "report.pdf" }],
 * });
 *
 * console.log(report.summary);
 * // { total: 3, verified: 2, partial: 1, notFound: 0 }
 * ```
 *
 * @packageDocumentation
 */

export { createFactCheckAgent } from "./factCheckAgent.js";

// Type-only re-exports are allowed per CLAUDE.md rules
export type {
  FactCheckAgentConfig,
  FactCheckCitationResult,
  FactCheckOptions,
  FactCheckReport,
  FactCheckSource,
  FactCheckSummary,
  LlmChatFunction,
  LlmMessage,
} from "./types.js";
