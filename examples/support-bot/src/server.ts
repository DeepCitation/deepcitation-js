/**
 * DeepCitation Support Bot Example
 *
 * A complete example of a customer support bot that:
 * - Verifies all AI responses against knowledge base documents
 * - Returns clean responses WITHOUT visible citations to customers
 * - Tracks confidence scores for quality monitoring
 * - Includes quality gates to flag low-confidence responses
 *
 * Run: npm start
 * Then: curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" \
 *       -d '{"question": "What is your refund policy?"}'
 */

import "dotenv/config";
import express from "express";
import { SupportBot, type SupportBotResponse } from "./support-bot.js";

const app = express();
app.use(express.json());

// Initialize the support bot with knowledge base
const bot = new SupportBot({
  deepcitationApiKey: process.env.DEEPCITATION_API_KEY!,
  openaiApiKey: process.env.OPENAI_API_KEY!,
  minConfidenceThreshold: parseFloat(process.env.MIN_CONFIDENCE_THRESHOLD || "0.8"),
});

// Sample knowledge base - in production, load from files/database
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
Tracking information sent via email within 24 hours of shipment.

ACCOUNT MANAGEMENT
------------------
To reset your password, click "Forgot Password" on the login page.
Account deletion requests are processed within 48 hours.
You can update billing information in Account Settings > Payment Methods.
Two-factor authentication is available for enhanced security.

WARRANTY INFORMATION
--------------------
All hardware products include a 2-year manufacturer warranty.
Warranty covers defects in materials and workmanship.
Accidental damage is not covered under standard warranty.
Extended warranty available for purchase within 30 days of product purchase.
`;

// Initialize knowledge base on startup
let isReady = false;
bot.loadKnowledgeBase(KNOWLEDGE_BASE, "support-kb.txt").then(() => {
  isReady = true;
  console.log("✅ Knowledge base loaded\n");
});

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({ status: isReady ? "ready" : "initializing" });
});

/**
 * Chat endpoint - Customer-facing support bot
 *
 * Request:  { "question": "What is your refund policy?" }
 * Response: {
 *   "response": "All purchases are eligible for a full refund within 30 days...",
 *   "confidence": 0.95,
 *   "needsReview": false
 * }
 */
app.post("/chat", async (req, res) => {
  if (!isReady) {
    return res.status(503).json({ error: "Service initializing, please retry" });
  }

  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const result = await bot.answer(question);

    // Return clean response to customer (no visible citations)
    res.json({
      response: result.cleanResponse,
      confidence: result.confidence,
      needsReview: result.needsReview,
    });

    // Log detailed verification for monitoring (would go to analytics in production)
    logVerificationDetails(question, result);
  } catch (error) {
    console.error("Error processing question:", error);
    res.status(500).json({ error: "Failed to process question" });
  }
});

/**
 * Internal endpoint - Returns full verification details
 * Use for debugging, admin dashboards, or audit logs
 */
app.post("/chat/detailed", async (req, res) => {
  if (!isReady) {
    return res.status(503).json({ error: "Service initializing, please retry" });
  }

  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const result = await bot.answer(question);

    // Return full details including verification info
    res.json({
      response: result.cleanResponse,
      rawResponse: result.rawResponse,
      confidence: result.confidence,
      needsReview: result.needsReview,
      citations: {
        total: result.totalCitations,
        verified: result.verifiedCitations,
        details: result.verificationDetails,
      },
    });
  } catch (error) {
    console.error("Error processing question:", error);
    res.status(500).json({ error: "Failed to process question" });
  }
});

function logVerificationDetails(question: string, result: SupportBotResponse) {
  const timestamp = new Date().toISOString();
  const status = result.needsReview ? "⚠️  NEEDS REVIEW" : "✅ OK";

  console.log(`\n[${timestamp}] ${status}`);
  console.log(`Question: "${question}"`);
  console.log(
    `Confidence: ${(result.confidence * 100).toFixed(0)}% ` +
      `(${result.verifiedCitations}/${result.totalCitations} citations verified)`
  );

  if (result.needsReview) {
    console.log("⚠️  Response flagged for human review due to low confidence");
  }
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║            DeepCitation Support Bot Example                ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Server running at http://localhost:${PORT}                   ║
║                                                            ║
║  Endpoints:                                                ║
║    POST /chat          - Customer-facing (clean response)  ║
║    POST /chat/detailed - Admin (full verification details) ║
║    GET  /health        - Health check                      ║
║                                                            ║
║  Try it:                                                   ║
║    curl -X POST http://localhost:${PORT}/chat \\              ║
║      -H "Content-Type: application/json" \\                 ║
║      -d '{"question": "What is your refund policy?"}'      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
  console.log("⏳ Loading knowledge base...");
});
