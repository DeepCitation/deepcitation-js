import { useState } from "react";
import { CitationDrawer } from "../CitationDrawer";
import type { CitationDrawerItem } from "../CitationDrawer.types";
import { groupCitationsBySource } from "../CitationDrawer.utils";
import { CitationDrawerTrigger } from "../CitationDrawerTrigger";

/**
 * Test harness that wires CitationDrawerTrigger + CitationDrawer together
 * with shared props, for Playwright CT label-consistency tests.
 */
export function TriggerAndDrawer({
  citations,
  sourceLabelMap,
}: {
  citations: CitationDrawerItem[];
  sourceLabelMap?: Record<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const groups = groupCitationsBySource(citations, sourceLabelMap);

  return (
    <div data-testid="harness">
      <CitationDrawerTrigger
        citationGroups={groups}
        onClick={() => setIsOpen(true)}
        isOpen={isOpen}
        sourceLabelMap={sourceLabelMap}
      />
      <CitationDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        citationGroups={groups}
        sourceLabelMap={sourceLabelMap}
      />
    </div>
  );
}
