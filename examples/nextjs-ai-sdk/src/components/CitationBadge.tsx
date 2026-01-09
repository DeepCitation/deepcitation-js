"use client";

import { useState } from "react";

interface CitationBadgeProps {
  citationNumber: number;
  status: "verified" | "partial" | "miss" | "pending";
  matchSnippet?: string;
  pageNumber?: number;
  onHover?: () => void;
}

export function CitationBadge({
  citationNumber,
  status,
  matchSnippet,
  pageNumber,
  onHover,
}: CitationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const statusClasses = {
    verified: "citation-verified",
    partial: "citation-partial",
    miss: "citation-miss",
    pending: "citation-pending",
  };

  const statusIcons = {
    verified: "✓",
    partial: "◐",
    miss: "✗",
    pending: "○",
  };

  return (
    <span
      className={`citation ${statusClasses[status]} relative`}
      onMouseEnter={() => {
        setShowTooltip(true);
        onHover?.();
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="font-mono">[{citationNumber}]</span>
      <span>{statusIcons[status]}</span>

      {/* Tooltip */}
      {showTooltip && (matchSnippet || pageNumber) && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs z-10">
          {pageNumber && (
            <div className="font-medium mb-1">Page {pageNumber}</div>
          )}
          {matchSnippet && (
            <div className="text-gray-300 line-clamp-3">"{matchSnippet}"</div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  );
}
