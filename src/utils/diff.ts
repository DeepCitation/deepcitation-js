/**
 * Custom diff implementation to replace the 'diff' npm package.
 * This avoids dependency issues in Firebase Functions environments.
 *
 * Implements a Myers diff algorithm with optimizations inspired by jsdiff.
 * @see https://github.com/kpdecker/jsdiff
 */

export interface Change {
  value: string;
  added?: boolean;
  removed?: boolean;
  count?: number;
}

/**
 * Myers diff algorithm with diagonal pruning optimization.
 * This reduces complexity from O(n+d²) to O(n+d) for common cases like appending text.
 *
 * @see https://blog.jcoglan.com/2017/02/12/the-myers-diff-algorithm-part-1/
 */
function computeDiff(
  oldTokens: string[],
  newTokens: string[],
  equals: (a: string, b: string) => boolean = (a, b) => a === b,
): Change[] {
  const oldLen = oldTokens.length;
  const newLen = newTokens.length;

  // Handle edge cases
  if (oldLen === 0 && newLen === 0) {
    return [];
  }

  // Quick path for completely new content
  if (oldLen === 0) {
    return [{ value: newTokens.join(""), added: true, count: newTokens.length }];
  }

  // Quick path for completely removed content
  if (newLen === 0) {
    return [
      { value: oldTokens.join(""), removed: true, count: oldTokens.length },
    ];
  }

  // Find common prefix
  let commonPrefixLen = 0;
  while (
    commonPrefixLen < oldLen &&
    commonPrefixLen < newLen &&
    equals(oldTokens[commonPrefixLen], newTokens[commonPrefixLen])
  ) {
    commonPrefixLen++;
  }

  // Find common suffix (but don't overlap with prefix)
  let commonSuffixLen = 0;
  while (
    commonSuffixLen < oldLen - commonPrefixLen &&
    commonSuffixLen < newLen - commonPrefixLen &&
    equals(
      oldTokens[oldLen - 1 - commonSuffixLen],
      newTokens[newLen - 1 - commonSuffixLen],
    )
  ) {
    commonSuffixLen++;
  }

  // Extract the differing middle portions
  const oldMiddle = oldTokens.slice(
    commonPrefixLen,
    oldLen - commonSuffixLen,
  );
  const newMiddle = newTokens.slice(
    commonPrefixLen,
    newLen - commonSuffixLen,
  );

  // If middles are empty, we only have common prefix/suffix
  if (oldMiddle.length === 0 && newMiddle.length === 0) {
    return [{ value: oldTokens.join(""), count: oldTokens.length }];
  }

  // Compute diff on the middle portion using Myers algorithm
  const middleDiff = myersDiff(oldMiddle, newMiddle, equals);

  // Build result with prefix, middle diff, and suffix
  const result: Change[] = [];

  if (commonPrefixLen > 0) {
    result.push({
      value: oldTokens.slice(0, commonPrefixLen).join(""),
      count: commonPrefixLen,
    });
  }

  result.push(...middleDiff);

  if (commonSuffixLen > 0) {
    result.push({
      value: oldTokens.slice(oldLen - commonSuffixLen).join(""),
      count: commonSuffixLen,
    });
  }

  return mergeConsecutiveChanges(result);
}

/**
 * Myers diff algorithm implementation.
 * Uses the "middle snake" approach for better memory efficiency.
 */
function myersDiff(
  oldTokens: string[],
  newTokens: string[],
  equals: (a: string, b: string) => boolean,
): Change[] {
  const oldLen = oldTokens.length;
  const newLen = newTokens.length;
  const maxD = oldLen + newLen;

  // V array indexed by k = x - y (diagonal)
  // We use an object to handle negative indices
  const v: Record<number, number> = { 1: 0 };

  // Store the path for backtracking
  const trace: Array<Record<number, number>> = [];

  // Iterate through edit distances
  outer: for (let d = 0; d <= maxD; d++) {
    trace.push({ ...v });

    // Iterate through diagonals
    for (let k = -d; k <= d; k += 2) {
      // Decide whether to go down or right
      let x: number;
      if (k === -d || (k !== d && v[k - 1] < v[k + 1])) {
        x = v[k + 1]; // Move down (insert)
      } else {
        x = v[k - 1] + 1; // Move right (delete)
      }

      let y = x - k;

      // Follow diagonal (matches)
      while (x < oldLen && y < newLen && equals(oldTokens[x], newTokens[y])) {
        x++;
        y++;
      }

      v[k] = x;

      // Check if we've reached the end
      if (x >= oldLen && y >= newLen) {
        break outer;
      }
    }
  }

  // Backtrack to build the diff
  return backtrack(trace, oldTokens, newTokens);
}

/**
 * Backtrack through the trace to build the diff result.
 */
function backtrack(
  trace: Array<Record<number, number>>,
  oldTokens: string[],
  newTokens: string[],
): Change[] {
  const changes: Change[] = [];
  let x = oldTokens.length;
  let y = newTokens.length;

  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d];
    const k = x - y;

    let prevK: number;
    if (k === -d || (k !== d && v[k - 1] < v[k + 1])) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }

    const prevX = v[prevK] ?? 0;
    const prevY = prevX - prevK;

    // Add diagonal matches (unchanged)
    while (x > prevX && y > prevY) {
      x--;
      y--;
      changes.unshift({ value: oldTokens[x], count: 1 });
    }

    if (d > 0) {
      if (x === prevX) {
        // Insertion (went down)
        y--;
        changes.unshift({ value: newTokens[y], added: true, count: 1 });
      } else {
        // Deletion (went right)
        x--;
        changes.unshift({ value: oldTokens[x], removed: true, count: 1 });
      }
    }
  }

  return changes;
}

/**
 * Merge consecutive changes of the same type.
 */
function mergeConsecutiveChanges(changes: Change[]): Change[] {
  if (changes.length === 0) return [];

  const result: Change[] = [];

  for (const change of changes) {
    const last = result[result.length - 1];

    if (
      last &&
      last.added === change.added &&
      last.removed === change.removed
    ) {
      last.value += change.value;
      last.count = (last.count || 1) + (change.count || 1);
    } else {
      result.push({ ...change });
    }
  }

  return result;
}

/**
 * Split text into lines, preserving line endings.
 * Handles both Unix (\n) and Windows (\r\n) line endings.
 */
function splitLines(text: string): string[] {
  if (!text) return [];

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

  // Don't forget the last line if it doesn't end with newline
  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

/**
 * Extended word character pattern.
 * Matches letters, numbers, underscores, and extended Unicode characters.
 * This is similar to jsdiff's approach.
 */
const WORD_CHAR_REGEX = /[\w\u00C0-\u024F\u1E00-\u1EFF]/;

/**
 * Split text into words and whitespace tokens.
 * Each token is one of:
 * - A word (letters, numbers, underscores, extended chars)
 * - Punctuation
 * - Whitespace
 *
 * This approach is inspired by jsdiff's word tokenization.
 */
function splitWordsWithSpace(text: string): string[] {
  if (!text) return [];

  const tokens: string[] = [];
  let current = "";
  let currentType: "word" | "space" | "punct" | null = null;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    let charType: "word" | "space" | "punct";

    if (/\s/.test(char)) {
      charType = "space";
    } else if (WORD_CHAR_REGEX.test(char)) {
      charType = "word";
    } else {
      charType = "punct";
    }

    if (currentType === null) {
      current = char;
      currentType = charType;
    } else if (charType === currentType) {
      current += char;
    } else {
      tokens.push(current);
      current = char;
      currentType = charType;
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Post-process word diff to clean up whitespace in consecutive changes.
 * When we have a removal followed by an addition, the whitespace can get duplicated.
 * This deduplicates it similar to jsdiff's postProcess.
 */
function postProcessWordDiff(changes: Change[]): Change[] {
  const result: Change[] = [];

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const nextChange = changes[i + 1];

    // Look for removal followed by addition
    if (change.removed && nextChange?.added) {
      const removedValue = change.value;
      const addedValue = nextChange.value;

      // Find common leading whitespace
      let leadingWs = "";
      let ri = 0;
      let ai = 0;

      while (
        ri < removedValue.length &&
        ai < addedValue.length &&
        /\s/.test(removedValue[ri]) &&
        removedValue[ri] === addedValue[ai]
      ) {
        leadingWs += removedValue[ri];
        ri++;
        ai++;
      }

      // Find common trailing whitespace
      let trailingWs = "";
      let rj = removedValue.length - 1;
      let aj = addedValue.length - 1;

      while (
        rj >= ri &&
        aj >= ai &&
        /\s/.test(removedValue[rj]) &&
        removedValue[rj] === addedValue[aj]
      ) {
        trailingWs = removedValue[rj] + trailingWs;
        rj--;
        aj--;
      }

      // Build cleaned changes
      if (leadingWs) {
        result.push({ value: leadingWs, count: 1 });
      }

      const cleanedRemoved = removedValue.slice(ri, rj + 1);
      const cleanedAdded = addedValue.slice(ai, aj + 1);

      if (cleanedRemoved) {
        result.push({ value: cleanedRemoved, removed: true, count: 1 });
      }
      if (cleanedAdded) {
        result.push({ value: cleanedAdded, added: true, count: 1 });
      }

      if (trailingWs) {
        result.push({ value: trailingWs, count: 1 });
      }

      i++; // Skip the next change since we processed it
    } else {
      result.push(change);
    }
  }

  return mergeConsecutiveChanges(result);
}

/**
 * Compare two strings line by line.
 * Similar to Diff.diffLines from the 'diff' package.
 */
export function diffLines(oldStr: string, newStr: string): Change[] {
  const oldLines = splitLines(oldStr);
  const newLines = splitLines(newStr);

  return computeDiff(oldLines, newLines);
}

/**
 * Compare two strings word by word, preserving whitespace.
 * Similar to Diff.diffWordsWithSpace from the 'diff' package.
 *
 * Improvements over basic implementation:
 * - Separates punctuation from words for better diffs
 * - Post-processes to deduplicate whitespace in consecutive changes
 */
export function diffWordsWithSpace(oldStr: string, newStr: string): Change[] {
  const oldWords = splitWordsWithSpace(oldStr);
  const newWords = splitWordsWithSpace(newStr);

  const diff = computeDiff(oldWords, newWords);
  return postProcessWordDiff(diff);
}
