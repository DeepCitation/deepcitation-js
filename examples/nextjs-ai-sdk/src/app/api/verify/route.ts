import { NextRequest, NextResponse } from "next/server";
import {
  verifyCitations,
  getAllCitationsFromLlmOutput,
  getCitationStatus,
} from "@/lib/deepcitation";

export async function POST(req: NextRequest) {
  try {
    const { sessionId = "default", content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    // Extract citations from the content
    const citations = getAllCitationsFromLlmOutput(content);
    const citationCount = Object.keys(citations).length;

    if (citationCount === 0) {
      return NextResponse.json({
        citations: {},
        verifications: {},
        summary: {
          total: 0,
          verified: 0,
          missed: 0,
          pending: 0,
        },
      });
    }

    // Verify citations against uploaded documents
    const verifications = await verifyCitations(sessionId, content);

    // Calculate summary
    const verified = Object.values(verifications).filter(
      (v) => getCitationStatus(v).isVerified
    ).length;
    const missed = Object.values(verifications).filter(
      (v) => getCitationStatus(v).isMiss
    ).length;
    const pending = Object.values(verifications).filter(
      (v) => getCitationStatus(v).isPending
    ).length;

    return NextResponse.json({
      citations,
      verifications,
      summary: {
        total: citationCount,
        verified,
        missed,
        pending,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify citations" },
      { status: 500 }
    );
  }
}
