"use client";

import { useChat } from "ai/react";
import { useState, useRef, useEffect, useId } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { FileUpload } from "@/components/FileUpload";
import { VerificationPanel } from "@/components/VerificationPanel";

export default function Home() {
  const sessionId = useId();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [verifications, setVerifications] = useState<Record<string, any>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      body: { sessionId },
      onFinish: async (message) => {
        // Verify citations after message is complete
        if (uploadedFiles.length > 0 && message.role === "assistant") {
          setIsVerifying(true);
          try {
            const res = await fetch("/api/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                content: message.content,
              }),
            });
            const data = await res.json();
            setVerifications((prev) => ({
              ...prev,
              [message.id]: data,
            }));
          } catch (error) {
            console.error("Verification failed:", error);
          } finally {
            setIsVerifying(false);
          }
        }
      },
    });

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploadedFiles((prev) => [...prev, file.name]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get latest verification summary
  const latestVerification =
    messages.length > 0
      ? verifications[messages[messages.length - 1]?.id]
      : null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            DeepCitation Chat
          </h1>
          <p className="text-sm text-gray-500">
            Upload documents and ask questions with verified citations
          </p>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-white rounded-xl p-8 shadow-sm max-w-md">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Welcome to DeepCitation Chat
                </h2>
                <p className="text-gray-600 mb-4">
                  Upload a document to get started, then ask questions. Every AI
                  response will be verified against your source documents.
                </p>
                <div className="text-left text-sm text-gray-500">
                  <p className="font-medium mb-1">How it works:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Upload a PDF or document</li>
                    <li>Ask questions about its content</li>
                    <li>See verified citations with proof</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  verification={verifications[message.id]}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              )}
              {isVerifying && (
                <div className="flex items-center gap-2 text-blue-500 text-sm">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Verifying citations...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-white px-6 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <FileUpload
              onUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
            />
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={
                uploadedFiles.length > 0
                  ? "Ask a question about your documents..."
                  : "Upload a document first, then ask questions..."
              }
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>

          {uploadedFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {uploadedFiles.map((file, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {file}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verification Panel */}
      {latestVerification && latestVerification.summary?.total > 0 && (
        <VerificationPanel verification={latestVerification} />
      )}
    </div>
  );
}
