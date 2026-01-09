import React, { useEffect, useState } from "react";
import { useSmartDiff } from "./useSmartDiff.js";
import { classNames } from "./utils.js";
import { CheckIcon } from "./icons.js";

interface VerificationTabsProps {
  expected: string; // The AI's Claim
  actual: string; // The Source Text Found
  label?: string;
  renderCopyButton?: (text: string, position: "expected" | "found") => React.ReactNode;
  emptyText?: string;
}

type TabType = "found" | "diff" | "expected";

// Sub-component: The individual tab button
const TabButton = ({ isActive, onClick, label }: { isActive: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={e => {
      e.stopPropagation(); // Prevent tooltip from closing or dragging
      onClick();
    }}
    className={classNames("dc-tab-button", isActive ? "dc-tab-button--active" : "")}
    type="button"
  >
    {label}
  </button>
);

export const VerificationTabs: React.FC<VerificationTabsProps> = ({
  expected,
  actual,
  label,
  renderCopyButton,
  emptyText = "No text found",
}) => {
  const { diffResult, isHighVariance, hasDiff } = useSmartDiff(expected, actual);

  const [activeTab, setActiveTab] = useState<TabType>("diff");

  useEffect(() => {
    if (isHighVariance) {
      setActiveTab("found");
    } else {
      setActiveTab("diff");
    }
  }, [isHighVariance, expected, actual]);

  const renderFoundContent = () => (
    <div className="dc-tab-content dc-tab-content--found">
      {actual ? (
        <div className="dc-tab-text-wrapper">
          {renderCopyButton && <div className="dc-copy-button-wrapper">{renderCopyButton(actual, "found")}</div>}
          <div className="dc-tab-text">{actual}</div>
        </div>
      ) : (
        <span className="dc-tab-empty">{emptyText}</span>
      )}
    </div>
  );

  const isExactMatch = !hasDiff && Boolean(actual) && Boolean(expected);

  if (isExactMatch) {
    return (
      <div className="dc-verification-tabs dc-verification-tabs--exact">
        {label && <div className="dc-verification-label">{label}</div>}

        <div className="dc-exact-match-badge">
          <CheckIcon />
          <span>Exact match</span>
        </div>

        <div className="dc-exact-match-content">{renderFoundContent()}</div>
      </div>
    );
  }

  return (
    <div className="dc-verification-tabs">
      {label && <div className="dc-verification-label">{label}</div>}

      <div className="dc-tabs-container">
        <div className="dc-tabs-nav">
          <TabButton label="Expected" isActive={activeTab === "expected"} onClick={() => setActiveTab("expected")} />
          <TabButton label="Diff" isActive={activeTab === "diff"} onClick={() => setActiveTab("diff")} />
          <TabButton label="Found" isActive={activeTab === "found"} onClick={() => setActiveTab("found")} />
        </div>
      </div>

      <div className="dc-tabs-content">
        {activeTab === "found" && renderFoundContent()}

        {activeTab === "expected" && (
          <div className="dc-tab-content dc-tab-content--expected">
            <div className="dc-tab-text-wrapper">
              {renderCopyButton && (
                <div className="dc-copy-button-wrapper">{renderCopyButton(expected, "expected")}</div>
              )}
              <div className="dc-tab-text">{expected}</div>
            </div>
          </div>
        )}

        {activeTab === "diff" && (
          <div className="dc-tab-content dc-tab-content--diff">
            {!hasDiff ? (
              <div className="dc-exact-match-indicator">
                <CheckIcon />
                <span>Exact Match</span>
              </div>
            ) : (
              <div className="dc-diff-result">
                {diffResult.map((block, i) => (
                  <div
                    key={i}
                    className={classNames(
                      "dc-diff-block",
                      block.type === "added" ? "dc-diff-block--added" : "",
                      block.type === "removed" ? "dc-diff-block--removed" : "",
                    )}
                  >
                    {block.parts.map((part, j) => {
                      if (part.removed) {
                        return (
                          <span key={j} className="dc-diff-part dc-diff-part--removed" title="Expected but not found">
                            {part.value}
                          </span>
                        );
                      }
                      if (part.added) {
                        return (
                          <span key={j} className="dc-diff-part dc-diff-part--added" title="Actually found in source">
                            {part.value}
                          </span>
                        );
                      }
                      return (
                        <span key={j} className="dc-diff-part dc-diff-part--unchanged">
                          {part.value}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
