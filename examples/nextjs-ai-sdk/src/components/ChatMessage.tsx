"use client";

import ReactMarkdown from "react-markdown";
import { CitationBadge } from "./CitationBadge";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
  };
  verification?: {
    citations: Record<string, any>;
    verifications: Record<string, any>;
    summary: {
      total: number;
      verified: number;
      missed: number;
      pending: number;
    };
  };
}

export function ChatMessage({ message, verification }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Process content to replace citation tags with badges
  const processedContent = processContentWithCitations(message.content, verification);

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
          AI
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser ? "bg-blue-600 text-white" : "bg-white border shadow-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm">
            {processedContent}

            {/* Verification summary badge */}
            {verification && verification.summary.total > 0 && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-gray-500">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    verification.summary.verified === verification.summary.total
                      ? "bg-green-100 text-green-700"
                      : verification.summary.verified > 0
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {verification.summary.verified === verification.summary.total
                    ? "✓"
                    : verification.summary.verified > 0
                    ? "◐"
                    : "✗"}
                  {verification.summary.verified}/{verification.summary.total} citations verified
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-sm font-medium shrink-0">
          U
        </div>
      )}
    </div>
  );
}

function processContentWithCitations(
  content: string,
  verification?: {
    citations: Record<string, any>;
    verifications: Record<string, any>;
  },
): React.ReactNode {
  // Remove citation XML tags for clean display
  // In a full implementation, you'd parse these and render CitationBadge components
  const cleanContent = content
    .replace(/<cite[^>]*\/>/g, "") // Remove self-closing cite tags
    .replace(/<cite[^>]*>.*?<\/cite>/g, "") // Remove cite tags with content
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  return <ReactMarkdown>{cleanContent}</ReactMarkdown>;
}
