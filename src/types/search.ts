export type SearchStatus =
  | "loading"
  | "pending" // Page not ready, still retrying
  | "not_found"
  | "partial_text_found"
  | "found"
  | "found_value_only"
  | "found_phrase_missed_value"
  | "found_on_other_page"
  | "found_on_other_line"
  | "first_word_found"
  | "timestamp_wip";

export type SearchMethod =
  | "exact_line_match"
  | "line_with_buffer"
  | "current_page"
  | "adjacent_pages"
  | "expanded_window"
  | "regex_search"
  | "bm25_search"
  | "fuzzy_regex"
  | "first_word_fallback";

export interface SearchAttempt {
  method: SearchMethod;
  success: boolean;
  searchPhrases: string[]; // The actual phrase(s) searched for (e.g., ["$4.89", "4.89"])
  pageSearched?: number;
  matchScore?: number; // For BM25 and other scoring methods
  matchSnippet?: string;
  notes?: string; // Additional context about why it failed/succeeded
  durationMs?: number; // Time taken in milliseconds
  startTime?: number; // Timestamp when search started
  endTime?: number; // Timestamp when search ended
}

export interface SearchState {
  status: SearchStatus;

  expectedPage?: number | null;
  actualPage?: number | null;
  expectedLineIds?: number[] | null;
  actualLineIds?: number[] | null;

  actualTimestamps?: {
    startTime?: string;
    endTime?: string;
  };
  expectedTimestamps?: {
    startTime?: string;
    endTime?: string;
  };

  searchAttempts?: SearchAttempt[]; // Track all search attempts
}
