/**
 * Demo script - Run standalone without starting the server
 *
 * Run: npm run demo
 */

import "dotenv/config";
import { SupportBot } from "./support-bot.js";

const KNOWLEDGE_BASE = `
ACME Support Knowledge Base
===========================

REFUND POLICY
-------------
All purchases are eligible for a full refund within 30 days of purchase.
After 30 days, customers may receive store credit for unused products.
Digital products are non-refundable after download or activation.
To request a refund, contact support@acme.com or call 1-800-ACME-HELP.

SHIPPING INFORMATION
--------------------
Standard shipping: 5-7 business days ($5.99)
Express shipping: 2-3 business days ($12.99)
Overnight shipping: Next business day ($24.99)
Free standard shipping on orders over $50.
International shipping available to 40+ countries.

WARRANTY INFORMATION
--------------------
All hardware products include a 2-year manufacturer warranty.
Warranty covers defects in materials and workmanship.
Extended warranty available for purchase within 30 days of product purchase.
`;

async function main() {
  console.log("🤖 DeepCitation Support Bot Demo\n");

  const bot = new SupportBot({
    deepcitationApiKey: process.env.DEEPCITATION_API_KEY!,
    openaiApiKey: process.env.OPENAI_API_KEY!,
    minConfidenceThreshold: 0.8,
  });

  console.log("📚 Loading knowledge base...");
  await bot.loadKnowledgeBase(KNOWLEDGE_BASE, "support-kb.txt");
  console.log("✅ Knowledge base loaded\n");

  // Test questions
  const questions = [
    "What is your refund policy?",
    "How much does express shipping cost?",
    "How long is the warranty on hardware products?",
  ];

  for (const question of questions) {
    console.log("─".repeat(60));
    console.log(`❓ Customer: "${question}"\n`);

    const response = await bot.answer(question);

    console.log(`💬 Bot: ${response.cleanResponse}\n`);

    const confidenceIcon =
      response.confidence >= 0.8 ? "✅" : response.confidence >= 0.5 ? "⚠️ " : "❌";

    console.log(
      `${confidenceIcon} Confidence: ${(response.confidence * 100).toFixed(0)}% ` +
        `(${response.verifiedCitations}/${response.totalCitations} citations verified)`
    );

    if (response.needsReview) {
      console.log("⚠️  This response has been flagged for human review");
    }

    console.log();
  }

  console.log("─".repeat(60));
  console.log("\n✨ Demo complete!");
  console.log("\nNotice how the customer sees clean responses without citation");
  console.log("markers, while we track verification confidence internally.");
}

main().catch(console.error);
