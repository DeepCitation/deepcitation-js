import type { SearchAttempt } from "../types/search.js";

export interface GroupedSearchAttempt {
  key: string;
  attempt: SearchAttempt;
  duplicateCount: number;
}

function normalizePhrase(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveAttemptPage(attempt: SearchAttempt): number {
  return attempt.foundLocation?.page ?? attempt.pageSearched ?? 0;
}

/**
 * Groups attempts by normalized phrase + page.
 * Method-level retries (same phrase on the same page) are treated as one logical
 * search so the audit list doesn't flood with near-duplicate rows.
 */
export function groupSearchAttempts(attempts: SearchAttempt[]): GroupedSearchAttempt[] {
  const grouped: GroupedSearchAttempt[] = [];
  const indexByKey = new Map<string, number>();

  for (const attempt of attempts) {
    const key = `${normalizePhrase(attempt.searchPhrase)}|${resolveAttemptPage(attempt)}`;
    const existingIndex = indexByKey.get(key);

    if (existingIndex == null) {
      indexByKey.set(key, grouped.length);
      grouped.push({ key, attempt, duplicateCount: 1 });
      continue;
    }

    const existing = grouped[existingIndex];
    existing.duplicateCount += 1;
    // Prefer a successful representative when any duplicate attempt succeeds.
    if (!existing.attempt.success && attempt.success) {
      existing.attempt = attempt;
    }
  }

  return grouped;
}

export function getUniqueSearchAttemptCount(attempts: SearchAttempt[]): number {
  return groupSearchAttempts(attempts).length;
}
