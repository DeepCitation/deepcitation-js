/**
 * Custom diff implementation to replace the 'diff' npm package.
 * This avoids dependency issues in Firebase Functions environments.
 *
 * Implements a simple Myers diff algorithm for line and word diffing.
 */

export interface Change {
  value: string;
  added?: boolean;
  removed?: boolean;
  count?: number;
}

/**
 * Compute the longest common subsequence (LCS) using dynamic programming.
 * Returns the diff as an array of Change objects.
 */
function computeDiff(oldTokens: string[], newTokens: string[]): Change[] {
  const oldLen = oldTokens.length;
  const newLen = newTokens.length;

  // Build LCS matrix
  const lcs: number[][] = Array(oldLen + 1)
    .fill(null)
    .map(() => Array(newLen + 1).fill(0));

  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      if (oldTokens[i - 1] === newTokens[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }

  // Backtrack to find the diff
  const result: Change[] = [];
  let i = oldLen;
  let j = newLen;

  // We'll build the result in reverse, then flip it
  const reversedChanges: Change[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      // Common element
      reversedChanges.push({ value: oldTokens[i - 1], count: 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      // Added in new
      reversedChanges.push({ value: newTokens[j - 1], added: true, count: 1 });
      j--;
    } else {
      // Removed from old
      reversedChanges.push({
        value: oldTokens[i - 1],
        removed: true,
        count: 1,
      });
      i--;
    }
  }

  // Reverse and merge consecutive changes of the same type
  for (let k = reversedChanges.length - 1; k >= 0; k--) {
    const change = reversedChanges[k];
    const lastChange = result[result.length - 1];

    if (
      lastChange &&
      lastChange.added === change.added &&
      lastChange.removed === change.removed
    ) {
      // Merge with previous change
      lastChange.value += change.value;
      lastChange.count = (lastChange.count || 1) + 1;
    } else {
      result.push({ ...change });
    }
  }

  return result;
}

/**
 * Split text into lines, preserving line endings.
 */
function splitLines(text: string): string[] {
  const lines: string[] = [];
  let current = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    current += char;
    if (char === "\n") {
      lines.push(current);
      current = "";
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

/**
 * Split text into words, preserving whitespace as separate tokens.
 */
function splitWordsWithSpace(text: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inWhitespace = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isWhitespace = /\s/.test(char);

    if (current.length === 0) {
      current = char;
      inWhitespace = isWhitespace;
    } else if (isWhitespace === inWhitespace) {
      current += char;
    } else {
      tokens.push(current);
      current = char;
      inWhitespace = isWhitespace;
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Compare two strings line by line.
 * Similar to Diff.diffLines from the 'diff' package.
 */
export function diffLines(oldStr: string, newStr: string): Change[] {
  const oldLines = splitLines(oldStr);
  const newLines = splitLines(newStr);

  if (oldLines.length === 0 && newLines.length === 0) {
    return [];
  }

  if (oldLines.length === 0) {
    return [{ value: newStr, added: true, count: newLines.length }];
  }

  if (newLines.length === 0) {
    return [{ value: oldStr, removed: true, count: oldLines.length }];
  }

  return computeDiff(oldLines, newLines);
}

/**
 * Compare two strings word by word, preserving whitespace.
 * Similar to Diff.diffWordsWithSpace from the 'diff' package.
 */
export function diffWordsWithSpace(oldStr: string, newStr: string): Change[] {
  const oldWords = splitWordsWithSpace(oldStr);
  const newWords = splitWordsWithSpace(newStr);

  if (oldWords.length === 0 && newWords.length === 0) {
    return [];
  }

  if (oldWords.length === 0) {
    return [{ value: newStr, added: true, count: newWords.length }];
  }

  if (newWords.length === 0) {
    return [{ value: oldStr, removed: true, count: oldWords.length }];
  }

  return computeDiff(oldWords, newWords);
}
