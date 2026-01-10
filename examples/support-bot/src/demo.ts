/**
 * Demo script - Run standalone without starting the server
 *
 * Run: npm run demo
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { SupportBot } from "./support-bot.js";

// Get current directory for loading sample file
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("🤖 DeepCitation Support Bot Demo\n");

  const bot = new SupportBot({
    deepcitationApiKey: process.env.DEEPCITATION_API_KEY!,
    openaiApiKey: process.env.OPENAI_API_KEY!,
    minConfidenceThreshold: 0.8,
  });

  console.log("📚 Loading knowledge base...");
  // Load the sample medical chart image from shared assets
  const chartImage = readFileSync(resolve(__dirname, "../../assets/john-doe-50-m-chart.jpg"));
  await bot.loadKnowledgeBase(chartImage, "john-doe-50-m-chart.jpg");
  console.log("✅ Knowledge base loaded\n");

  // Test questions about the medical chart
  const questions = [
    "What is the patient's diagnosis?",
    "What medications is the patient on?",
    "What is the treatment plan?",
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
