/**
 * DeepCitation Basic Example - OpenAI
 *
 * This example demonstrates the complete 3-step workflow:
 * 1. Pre-Prompt: Upload documents and enhance prompts
 * 2. Post-Prompt: Verify citations against source documents
 * 3. Display: Show verification results
 *
 * Run: npm run start:openai
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";
import OpenAI from "openai";
import {
  DeepCitation,
  wrapCitationPrompt,
  getCitationStatus,
  removeCitations,
} from "@deepcitation/deepcitation-js";

// Initialize clients
const deepcitation = new DeepCitation({
  apiKey: process.env.DEEPCITATION_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function main() {
  console.log("🔍 DeepCitation Basic Example - OpenAI\n");

  // ============================================
  // STEP 1: PRE-PROMPT
  // Upload documents and prepare citation-enhanced prompts
  // ============================================

  console.log("📄 Step 1: Uploading document and preparing prompts...\n");

  // Load your PDF document (replace with your own file)
  // For this example, we'll create a simple text buffer
  const sampleDocument = Buffer.from(`
    ACME Corporation Annual Report 2024

    Executive Summary
    ACME Corporation achieved record revenue of $4.2 billion in fiscal year 2024,
    representing a 23% increase from the previous year. Net profit margin improved
    to 18.5%, up from 15.2% in 2023.

    Key Highlights:
    - Total revenue: $4.2 billion (up 23% YoY)
    - Net profit margin: 18.5%
    - Customer base grew to 2.3 million active users
    - Launched 12 new products across 3 categories
    - Employee count reached 8,500 globally

    Regional Performance:
    North America contributed 45% of total revenue ($1.89B), while Europe
    accounted for 30% ($1.26B). Asia-Pacific showed the strongest growth
    at 35% YoY, now representing 25% of revenue ($1.05B).

    Outlook for 2025:
    Management projects revenue growth of 15-20% for fiscal year 2025,
    with continued expansion in Asia-Pacific markets.
  `);

  // Upload documents to DeepCitation
  const { fileDataParts, fileDeepTexts } = await deepcitation.prepareFiles([
    { file: sampleDocument, filename: "annual-report-2024.pdf" },
  ]);

  console.log("✅ Document uploaded successfully");
  console.log(`   File ID: ${fileDataParts[0].fileId}\n`);

  // Wrap your prompts with citation instructions
  const systemPrompt = `You are a financial analyst assistant. Answer questions
about the provided documents accurately and cite your sources.`;

  const userQuestion = "What was ACME's revenue growth and which region performed best?";

  const { enhancedSystemPrompt, enhancedUserPrompt } = wrapCitationPrompt({
    systemPrompt,
    userPrompt: userQuestion,
    fileDeepText: fileDeepTexts, // Pass file content directly
  });

  // ============================================
  // STEP 2: CALL LLM & VERIFY
  // Get response from LLM and verify all citations
  // ============================================

  console.log("🤖 Step 2: Calling OpenAI and verifying citations...\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: enhancedSystemPrompt },
      { role: "user", content: enhancedUserPrompt },
    ],
  });

  const llmResponse = completion.choices[0].message.content!;
  console.log("📝 LLM Response (raw with citations):");
  console.log("─".repeat(50));
  console.log(llmResponse);
  console.log("─".repeat(50) + "\n");

  // Verify all citations against the source document
  const verificationResult = await deepcitation.verifyCitations({
    llmOutput: llmResponse,
    fileDataParts,
  });

  // ============================================
  // STEP 3: DISPLAY RESULTS
  // Show verification status for each citation
  // ============================================

  console.log("✨ Step 3: Verification Results\n");

  const citations = Object.entries(verificationResult.citations);

  if (citations.length === 0) {
    console.log("⚠️  No citations found in the response.\n");
  } else {
    console.log(`Found ${citations.length} citation(s):\n`);

    for (const [key, highlight] of citations) {
      const status = getCitationStatus(highlight);
      const statusIcon = status.isVerified
        ? status.isPartialMatch
          ? "⚠️ "
          : "✅"
        : status.isPending
          ? "⏳"
          : "❌";

      console.log(`Citation [${key}]: ${statusIcon}`);
      console.log(`  Status: ${highlight.searchState?.status}`);
      console.log(`  Page: ${highlight.pageNumber ?? "N/A"}`);
      console.log(`  Match: "${highlight.matchSnippet?.slice(0, 80)}..."`);
      console.log(`  Has proof image: ${!!highlight.verificationImageBase64}`);
      console.log();
    }
  }

  // Show clean response (without citation tags)
  console.log("📖 Clean Response (for display):");
  console.log("─".repeat(50));
  console.log(removeCitations(llmResponse));
  console.log("─".repeat(50) + "\n");

  // Summary statistics
  const verified = citations.filter(([, h]) => getCitationStatus(h).isVerified).length;
  const missed = citations.filter(([, h]) => getCitationStatus(h).isMiss).length;

  console.log("📊 Summary:");
  console.log(`   Total citations: ${citations.length}`);
  console.log(`   Verified: ${verified} (${((verified / citations.length) * 100).toFixed(0)}%)`);
  console.log(`   Not found: ${missed}`);
}

main().catch(console.error);
