import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createFactCheckAgent } from "../agent/factCheckAgent.js";
import type { LlmChatFunction, LlmMessage } from "../agent/types.js";

// Mock global fetch
const mockFetch = jest.fn() as jest.Mock;
global.fetch = mockFetch;

/**
 * Helper: create a mock LLM function that returns a canned response
 * with DeepCitation deferred citation format.
 */
function createMockLlm(response: string): LlmChatFunction {
  return jest.fn(async (_messages: LlmMessage[]) => response) as unknown as LlmChatFunction;
}

/** Simulates a successful file upload response from the DeepCitation API */
function mockUploadResponse(attachmentId: string, text: string) {
  return {
    ok: true,
    json: async () => ({
      attachmentId,
      deepTextPromptPortion: text,
      metadata: {
        filename: "test.pdf",
        mimeType: "application/pdf",
        pageCount: 1,
        textByteSize: text.length,
      },
      status: "ready",
    }),
  } as Response;
}

/** Simulates a successful verification response */
function mockVerifyResponse(verifications: Record<string, { status: string }>) {
  return {
    ok: true,
    json: async () => ({ verifications }),
  } as Response;
}

describe("createFactCheckAgent", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("returns an object with a factCheck method", () => {
    const agent = createFactCheckAgent({
      apiKey: "sk-dc-test",
      llm: createMockLlm(""),
    });
    expect(typeof agent.factCheck).toBe("function");
  });

  describe("factCheck", () => {
    it("returns empty report when LLM produces no citations", async () => {
      const mockLlm = createMockLlm("This is a plain response with no citations.");

      // Mock file upload
      mockFetch.mockResolvedValueOnce(
        mockUploadResponse("att_123", "[Page 1]\n[L1] Revenue grew 15%"),
      );

      const agent = createFactCheckAgent({
        apiKey: "sk-dc-test",
        llm: mockLlm,
      });

      const report = await agent.factCheck({
        content: "Check this content",
        sources: [{ type: "file", file: new Blob(["pdf data"]), filename: "report.pdf" }],
      });

      expect(report.summary.total).toBe(0);
      expect(report.summary.verified).toBe(0);
      expect(report.results).toHaveLength(0);
      expect(report.citations).toEqual({});
      expect(report.verifications).toEqual({});
      expect(report.visibleText).toBe("This is a plain response with no citations.");
      expect(report.fileDataParts).toHaveLength(1);
      expect(report.fileDataParts[0].attachmentId).toBe("att_123");
    });

    it("performs full workflow with file source and inline citations", async () => {
      const llmResponse =
        "The company showed strong growth. <cite attachment_id='att_abc' start_page_key='page_number_1_index_0' full_phrase='Revenue grew 15%' anchor_text='15%' line_ids='1' />";

      const mockLlm = createMockLlm(llmResponse);

      // Mock upload
      mockFetch.mockResolvedValueOnce(
        mockUploadResponse("att_abc", "[Page 1]\n[L1] Revenue grew 15%"),
      );

      // Mock verification with real hash key (pre-computed from generateCitationKey)
      // Key "bdfb186b771dc647" corresponds to the citation above
      mockFetch.mockResolvedValueOnce(
        mockVerifyResponse({
          bdfb186b771dc647: {
            status: "found",
            verifiedMatchSnippet: "Revenue grew 15%",
          },
        }),
      );

      const agent = createFactCheckAgent({
        apiKey: "sk-dc-test",
        llm: mockLlm,
      });

      const report = await agent.factCheck({
        content: "Verify revenue claims",
        sources: [{ type: "file", file: new Blob(["pdf"]), filename: "report.pdf" }],
      });

      // LLM should have been called with enhanced prompts
      expect(mockLlm).toHaveBeenCalledTimes(1);
      const messages = (mockLlm as jest.Mock).mock.calls[0][0] as LlmMessage[];
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe("system");
      expect(messages[1].role).toBe("user");

      // System prompt should contain citation instructions
      expect(messages[0].content).toContain("cite");

      // Citations should have been parsed and verified
      expect(report.summary.total).toBe(1);
      expect(report.summary.verified).toBe(1);
      expect(report.summary.partial).toBe(0);
      expect(report.summary.notFound).toBe(0);
      expect(report.results).toHaveLength(1);
      expect(report.results[0].verification?.status).toBe("found");
      expect(report.rawLlmOutput).toBe(llmResponse);
      expect(report.fileDataParts[0].attachmentId).toBe("att_abc");
    });

    it("performs full workflow with deferred citation format", async () => {
      const llmResponse = `The patient was born on March 15, 1985 [1]. They were diagnosed with Type 2 Diabetes [2].

<<<CITATION_DATA>>>
{
  "att_med": [
    {"id": 1, "reasoning": "DOB from demographics", "full_phrase": "Date of Birth: 03/15/1985", "anchor_text": "03/15/1985", "page_id": "1_0", "line_ids": [5]},
    {"id": 2, "reasoning": "diagnosis from clinical notes", "full_phrase": "Diagnosis: Type 2 Diabetes Mellitus", "anchor_text": "Type 2 Diabetes", "page_id": "2_1", "line_ids": [12]}
  ]
}
<<<END_CITATION_DATA>>>`;

      const mockLlm = createMockLlm(llmResponse);

      // Mock upload
      mockFetch.mockResolvedValueOnce(
        mockUploadResponse(
          "att_med",
          "[Page 1]\n[L5] Date of Birth: 03/15/1985\n[Page 2]\n[L12] Diagnosis: Type 2 Diabetes Mellitus",
        ),
      );

      // Mock verification — respond with both citations verified
      // Keys are pre-computed hashes: 41559d4b1504d6cd and 4c1b2f608a6aa4b0
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          verifications: {
            "41559d4b1504d6cd": {
              status: "found",
              verifiedMatchSnippet: "Date of Birth: 03/15/1985",
              document: { verifiedPageNumber: 1 },
            },
            "4c1b2f608a6aa4b0": {
              status: "found",
              verifiedMatchSnippet: "Diagnosis: Type 2 Diabetes Mellitus",
              document: { verifiedPageNumber: 2 },
            },
          },
        }),
      } as Response);

      const agent = createFactCheckAgent({
        apiKey: "sk-dc-test",
        llm: mockLlm,
      });

      const report = await agent.factCheck({
        content: "Verify patient data",
        sources: [{ type: "file", file: new Blob(["medical records"]), filename: "records.pdf" }],
      });

      expect(report.summary.total).toBe(2);
      expect(report.summary.verified).toBe(2);
      expect(report.summary.partial).toBe(0);
      expect(report.summary.notFound).toBe(0);
      // Visible text should not contain the CITATION_DATA block
      expect(report.visibleText).not.toContain("<<<CITATION_DATA>>>");
      expect(report.visibleText).toContain("March 15, 1985");
    });

    it("handles URL sources", async () => {
      const mockLlm = createMockLlm("No citations here.");

      // Mock URL preparation (prepareUrl calls POST /prepareFile with JSON body)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          attachmentId: "att_url",
          deepTextPromptPortion: "[Page 1]\n[L1] Article content",
          metadata: {
            filename: "example.com.pdf",
            mimeType: "application/pdf",
            pageCount: 1,
            textByteSize: 200,
          },
          status: "ready",
        }),
      } as Response);

      const agent = createFactCheckAgent({
        apiKey: "sk-dc-test",
        llm: mockLlm,
      });

      const report = await agent.factCheck({
        content: "Check this article",
        sources: [{ type: "url", url: "https://example.com/article" }],
      });

      expect(report.fileDataParts).toHaveLength(1);
      expect(report.fileDataParts[0].attachmentId).toBe("att_url");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("handles pre-prepared sources (type: prepared)", async () => {
      const mockLlm = createMockLlm("No citations.");

      const agent = createFactCheckAgent({
        apiKey: "sk-dc-test",
        llm: mockLlm,
      });

      const report = await agent.factCheck({
        content: "Check this",
        sources: [
          {
            type: "prepared",
            fileDataPart: {
              attachmentId: "att_pre",
              deepTextPromptPortion: "[Page 1]\n[L1] Pre-prepared content",
              filename: "existing.pdf",
            },
          },
        ],
      });

      // No fetch calls needed — source was already prepared
      expect(mockFetch).not.toHaveBeenCalled();
      expect(report.fileDataParts[0].attachmentId).toBe("att_pre");
    });

    it("handles multiple sources", async () => {
      const mockLlm = createMockLlm("Plain text, no citations.");

      // Two file uploads
      mockFetch
        .mockResolvedValueOnce(mockUploadResponse("att_1", "[Page 1]\n[L1] File 1 content"))
        .mockResolvedValueOnce(mockUploadResponse("att_2", "[Page 1]\n[L1] File 2 content"));

      const agent = createFactCheckAgent({
        apiKey: "sk-dc-test",
        llm: mockLlm,
      });

      const report = await agent.factCheck({
        content: "Verify against both files",
        sources: [
          { type: "file", file: new Blob(["pdf1"]), filename: "doc1.pdf" },
          { type: "file", file: new Blob(["pdf2"]), filename: "doc2.pdf" },
        ],
      });

      expect(report.fileDataParts).toHaveLength(2);
      expect(report.fileDataParts[0].attachmentId).toBe("att_1");
      expect(report.fileDataParts[1].attachmentId).toBe("att_2");
    });

    it("uses custom question when provided", async () => {
      const mockLlm = createMockLlm("No citations.");

      mockFetch.mockResolvedValueOnce(
        mockUploadResponse("att_q", "[Page 1]\n[L1] Content"),
      );

      const agent = createFactCheckAgent({
        apiKey: "sk-dc-test",
        llm: mockLlm,
      });

      await agent.factCheck({
        content: "Tax summary content",
        sources: [{ type: "file", file: new Blob(["pdf"]) }],
        question: "Is the revenue figure of $12.5M correct?",
      });

      const messages = (mockLlm as jest.Mock).mock.calls[0][0] as LlmMessage[];
      const userMessage = messages.find(m => m.role === "user");
      expect(userMessage?.content).toContain("Is the revenue figure of $12.5M correct?");
      expect(userMessage?.content).toContain("Tax summary content");
    });

    it("uses custom system prompt from options (overrides config)", async () => {
      const mockLlm = createMockLlm("No citations.");

      mockFetch.mockResolvedValueOnce(
        mockUploadResponse("att_sp", "[Page 1]\n[L1] Content"),
      );

      const agent = createFactCheckAgent({
        apiKey: "sk-dc-test",
        llm: mockLlm,
        systemPrompt: "Config-level prompt",
      });

      await agent.factCheck({
        content: "Content",
        sources: [{ type: "file", file: new Blob(["pdf"]) }],
        systemPrompt: "Options-level prompt",
      });

      const messages = (mockLlm as jest.Mock).mock.calls[0][0] as LlmMessage[];
      const systemMessage = messages.find(m => m.role === "system");
      // Options-level should override config-level
      expect(systemMessage?.content).toContain("Options-level prompt");
    });

    it("propagates upload errors", async () => {
      const mockLlm = createMockLlm("Unused");

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: "Invalid API key" } }),
      } as Response);

      const agent = createFactCheckAgent({
        apiKey: "sk-dc-bad",
        llm: mockLlm,
      });

      await expect(
        agent.factCheck({
          content: "Content",
          sources: [{ type: "file", file: new Blob(["pdf"]) }],
        }),
      ).rejects.toThrow();
    });

    it("propagates LLM errors", async () => {
      const failingLlm: LlmChatFunction = async () => {
        throw new Error("LLM rate limited");
      };

      mockFetch.mockResolvedValueOnce(
        mockUploadResponse("att_err", "[Page 1]\n[L1] Content"),
      );

      const agent = createFactCheckAgent({
        apiKey: "sk-dc-test",
        llm: failingLlm,
      });

      await expect(
        agent.factCheck({
          content: "Content",
          sources: [{ type: "file", file: new Blob(["pdf"]) }],
        }),
      ).rejects.toThrow("LLM rate limited");
    });

    it("correctly computes summary with mixed verification statuses", async () => {
      // LLM returns 3 inline citations
      const llmResponse = [
        "<cite attachment_id='att_mix' start_page_key='page_number_1_index_0' full_phrase='Claim one is correct' anchor_text='one' line_ids='1' />",
        "<cite attachment_id='att_mix' start_page_key='page_number_1_index_0' full_phrase='Claim two is partially correct' anchor_text='two' line_ids='2' />",
        "<cite attachment_id='att_mix' start_page_key='page_number_1_index_0' full_phrase='Claim three is wrong' anchor_text='three' line_ids='3' />",
      ].join(" ");

      const mockLlm = createMockLlm(llmResponse);

      // Upload
      mockFetch.mockResolvedValueOnce(
        mockUploadResponse("att_mix", "[Page 1]\n[L1] Content\n[L2] More\n[L3] Even more"),
      );

      // Verification with real hash keys (pre-computed from generateCitationKey):
      // "0204ca4361275bc6" = "Claim one is correct"
      // "8da14f51acad1ac8" = "Claim two is partially correct"
      // "56890e5e5d71402c" = "Claim three is wrong"
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          verifications: {
            "0204ca4361275bc6": { status: "found" },
            "8da14f51acad1ac8": { status: "partial_text_found" },
            "56890e5e5d71402c": { status: "not_found" },
          },
        }),
      } as Response);

      const agent = createFactCheckAgent({
        apiKey: "sk-dc-test",
        llm: mockLlm,
      });

      const report = await agent.factCheck({
        content: "Check three claims",
        sources: [{ type: "file", file: new Blob(["pdf"]) }],
      });

      // 3 citations were parsed from the LLM output
      expect(report.summary.total).toBe(3);
      expect(report.summary.verified).toBe(1);
      expect(report.summary.partial).toBe(1);
      expect(report.summary.notFound).toBe(1);
      // Each result should have a key, citation, and status
      expect(report.results).toHaveLength(3);
      for (const result of report.results) {
        expect(result.key).toBeDefined();
        expect(result.citation).toBeDefined();
        expect(result.status).toBeDefined();
      }
    });
  });
});
