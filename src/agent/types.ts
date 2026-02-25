import type { DeepCitationConfig, FileDataPart, VerifyCitationsOptions } from "../client/types.js";
import type { CitationRecord, CitationStatus, VerificationRecord } from "../types/citation.js";
import type { Verification } from "../types/verification.js";

/**
 * A chat message for the LLM.
 */
export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * A function that calls an LLM and returns the full response text.
 * Bring-your-own-LLM: the consumer provides this function so the SDK
 * stays free of LLM provider dependencies.
 *
 * @example
 * ```typescript
 * // OpenAI
 * const llm: LlmChatFunction = async (messages) => {
 *   const res = await openai.chat.completions.create({ model: "gpt-5-mini", messages });
 *   return res.choices[0].message.content ?? "";
 * };
 *
 * // Anthropic
 * const llm: LlmChatFunction = async (messages) => {
 *   const res = await anthropic.messages.create({
 *     model: "claude-sonnet-4-20250514",
 *     max_tokens: 4096,
 *     system: messages.filter(m => m.role === "system").map(m => m.content).join("\n"),
 *     messages: messages.filter(m => m.role !== "system"),
 *   });
 *   return res.content[0].type === "text" ? res.content[0].text : "";
 * };
 * ```
 */
export type LlmChatFunction = (messages: LlmMessage[]) => Promise<string>;

/**
 * A source to fact-check against. Can be a file (Buffer/Blob) or a URL string.
 */
export type FactCheckSource =
  | { type: "file"; file: File | Blob | Buffer; filename?: string }
  | { type: "url"; url: string }
  | { type: "prepared"; fileDataPart: FileDataPart };

/**
 * Configuration for creating a fact-check agent.
 */
export interface FactCheckAgentConfig {
  /** DeepCitation API key (starts with sk-dc-) */
  apiKey: string;
  /** Optional custom API base URL */
  apiUrl?: string;
  /** The LLM chat function (bring your own) */
  llm: LlmChatFunction;
  /** Optional system prompt override */
  systemPrompt?: string;
  /** Optional DeepCitation client config overrides */
  clientConfig?: Omit<DeepCitationConfig, "apiKey" | "apiUrl">;
}

/**
 * Options for a single fact-check run.
 */
export interface FactCheckOptions {
  /** Context or text to provide to the LLM alongside the source documents for citation generation */
  content: string;
  /** Source documents/URLs to verify against */
  sources: FactCheckSource[];
  /** Optional user question or context for the LLM */
  question?: string;
  /** Optional system prompt override (takes precedence over agent config) */
  systemPrompt?: string;
  /** Verification options (image format, proof URLs, etc.) */
  verificationOptions?: VerifyCitationsOptions;
}

/**
 * Summary statistics from a fact-check run.
 */
export interface FactCheckSummary {
  /** Total number of citations found in the LLM output */
  total: number;
  /** Number of fully verified citations */
  verified: number;
  /** Number of partially verified citations */
  partial: number;
  /** Number of unverified citations (not found in source) */
  notFound: number;
}

/**
 * Per-citation result combining the citation, verification, and status.
 */
export interface FactCheckCitationResult {
  /** The citation key */
  key: string;
  /** The original citation extracted from LLM output */
  citation: CitationRecord[string];
  /** The verification result from DeepCitation (undefined if server omitted this citation) */
  verification: Verification | undefined;
  /** The derived citation status */
  status: CitationStatus;
}

/**
 * The result of a fact-check run.
 */
export interface FactCheckReport {
  /** Per-citation results in order */
  results: FactCheckCitationResult[];
  /** All citations parsed from the LLM output */
  citations: CitationRecord;
  /** All verification results */
  verifications: VerificationRecord;
  /** Summary statistics */
  summary: FactCheckSummary;
  /** The raw LLM output (with citation markers) */
  rawLlmOutput: string;
  /** The visible text (citation data blocks stripped) */
  visibleText: string;
  /** Prepared file data parts (attachment IDs + text) */
  fileDataParts: FileDataPart[];
}
