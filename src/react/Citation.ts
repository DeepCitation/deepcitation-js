/**
 * Citation Primitives Namespace
 * @packageDocumentation
 */

import {
  CitationRoot,
  CitationTrigger,
  CitationBracket,
  CitationNumber,
  CitationAnchorText,
  CitationIndicator,
  CitationStatusComponent,
  CitationPhrase,
  CitationPage,
} from "./primitives.js";

/** Citation primitives namespace for composable citation components. */
export const Citation = {
  Root: CitationRoot,
  Trigger: CitationTrigger,
  Bracket: CitationBracket,
  Number: CitationNumber,
  AnchorText: CitationAnchorText,
  Indicator: CitationIndicator,
  Status: CitationStatusComponent,
  Phrase: CitationPhrase,
  Page: CitationPage,
} as const;
