import React, { useMemo } from "react";
import { useSmartDiff } from "./useSmartDiff.js";
import { classNames } from "./utils.js";

interface DiffDisplayProps {
  expected: string; // The "Target" or "Claimed" text
  actual: string; // The "Source" or "Found" text
  label?: string;
  className?: string;
  sanitize?: (text: string) => string;
}

const DiffDisplay: React.FC<DiffDisplayProps> = ({ expected, actual, label, className, sanitize }) => {
  // 1. Sanitize Inputs if sanitization function provided
  const { sanitizedExpected, sanitizedActual } = useMemo(() => {
    if (sanitize) {
      return {
        sanitizedExpected: sanitize(expected),
        sanitizedActual: sanitize(actual),
      };
    }
    return {
      sanitizedExpected: expected,
      sanitizedActual: actual,
    };
  }, [expected, actual, sanitize]);

  // 2. Run the Smart Diff Hook
  const { diffResult } = useSmartDiff(sanitizedExpected, sanitizedActual);

  return (
    <div className={classNames("dc-diff-display", className)}>
      {label && <div className="dc-diff-label">{label}</div>}

      <div className="dc-diff-content">
        <div className="dc-diff-blocks">
          {diffResult.map((block, blockIndex) => (
            <div
              key={`block-${blockIndex}`}
              className={classNames(
                "dc-diff-block",
                `dc-diff-block--${block.type}`,
                block.type === "added" ? "dc-diff-block-added" : "",
              )}
            >
              {block.parts.map((part, partIndex) => {
                const key = `p-${blockIndex}-${partIndex}`;

                if (part.removed) {
                  return (
                    <span key={key} className="dc-diff-part dc-diff-part--removed" title="Expected text">
                      {part.value}
                    </span>
                  );
                }

                if (part.added) {
                  return (
                    <span key={key} className="dc-diff-part dc-diff-part--added" title="Actual text found">
                      {part.value}
                    </span>
                  );
                }

                // Unchanged text
                return (
                  <span key={key} className="dc-diff-part dc-diff-part--unchanged">
                    {part.value}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiffDisplay;
