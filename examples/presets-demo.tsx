/**
 * Citation Presets Demo
 *
 * This file demonstrates all 4 Tailwind presets with different states and configurations.
 * Run this in your app to see the presets in action.
 *
 * Usage:
 * 1. Import this component in your app
 * 2. Make sure Tailwind CSS is configured
 * 3. Render <CitationPresetsDemo />
 */

import React, { useState } from 'react';
import { CitationBrackets, CitationInline, CitationMinimal, CitationSuperscript } from '../presets/index.js';
import type { Citation, FoundHighlightLocation } from '../../types/citation.js';

// Mock data for different verification states
const createMockCitation = (num: number, value?: string): Citation => ({
  citationNumber: num,
  fullPhrase: `This is example citation text from the source document for citation ${num}`,
  pageNumber: 12,
  lineId: "5",
  value: value,
});

const mockVerifications = {
  verified: {
    searchState: { status: 'found' as const },
    matchSnippet: "example citation text from the source",
  } as FoundHighlightLocation,

  partial: {
    searchState: { status: 'partial_text_found' as const },
    matchSnippet: "example citation text",
  } as FoundHighlightLocation,

  miss: {
    searchState: { status: 'not_found' as const },
  } as FoundHighlightLocation,

  pending: {
    searchState: { status: 'pending' as const },
  } as FoundHighlightLocation,
};

export function CitationPresetsDemo() {
  const [selectedState, setSelectedState] = useState<keyof typeof mockVerifications>('verified');
  const verification = mockVerifications[selectedState];

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Citation Presets Demo</h1>
        <p className="text-gray-600">
          Preview all 4 Tailwind-styled citation presets with different states
        </p>
      </div>

      {/* State Selector */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Verification State:</h2>
        <div className="flex gap-2">
          {(Object.keys(mockVerifications) as Array<keyof typeof mockVerifications>).map((state) => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`
                px-4 py-2 rounded font-medium transition-colors
                ${selectedState === state
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }
              `}
            >
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Current state: <span className="font-mono font-semibold">{selectedState}</span>
        </p>
      </div>

      {/* Preset Demos */}
      <div className="space-y-10">

        {/* CitationBrackets */}
        <section className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4">1. CitationBrackets</h2>
          <p className="text-gray-600 mb-6">Classic bracketed style with verification indicators</p>

          <div className="space-y-6">
            {/* Default Size */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">SIZES</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Small:</span>
                  <CitationBrackets
                    citation={createMockCitation(1)}
                    foundCitation={verification}
                    size="sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Default:</span>
                  <CitationBrackets
                    citation={createMockCitation(2)}
                    foundCitation={verification}
                    size="default"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Large:</span>
                  <CitationBrackets
                    citation={createMockCitation(3)}
                    foundCitation={verification}
                    size="lg"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">VARIANTS</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <CitationBrackets citation={createMockCitation(1)} foundCitation={verification} variant="default" />
                <CitationBrackets citation={createMockCitation(2)} foundCitation={verification} variant="primary" />
                <CitationBrackets citation={createMockCitation(3)} foundCitation={verification} variant="secondary" />
                <CitationBrackets citation={createMockCitation(4)} foundCitation={verification} variant="accent" />
              </div>
            </div>

            {/* In Context */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">IN CONTEXT</h3>
              <p className="text-base leading-relaxed">
                The company saw significant growth{' '}
                <CitationBrackets citation={createMockCitation(1)} foundCitation={verification} />
                {' '}in Q4, with revenue increasing by 25%{' '}
                <CitationBrackets citation={createMockCitation(2)} foundCitation={verification} />
                .
              </p>
            </div>
          </div>
        </section>

        {/* CitationInline */}
        <section className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4">2. CitationInline</h2>
          <p className="text-gray-600 mb-6">Inline text without brackets for seamless integration</p>

          <div className="space-y-6">
            {/* Indicator Positions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">INDICATOR POSITION</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-20">After:</span>
                  <CitationInline
                    citation={createMockCitation(1, "25% growth")}
                    foundCitation={verification}
                    indicatorPosition="after"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-20">Before:</span>
                  <CitationInline
                    citation={createMockCitation(2, "25% growth")}
                    foundCitation={verification}
                    indicatorPosition="before"
                  />
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">SIZES</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <CitationInline citation={createMockCitation(1, "small")} foundCitation={verification} size="sm" />
                <CitationInline citation={createMockCitation(2, "default")} foundCitation={verification} size="default" />
                <CitationInline citation={createMockCitation(3, "large")} foundCitation={verification} size="lg" />
              </div>
            </div>

            {/* In Context */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">IN CONTEXT</h3>
              <p className="text-base leading-relaxed">
                Revenue grew by{' '}
                <CitationInline
                  citation={createMockCitation(1, "25%")}
                  foundCitation={verification}
                />
                {' '}year-over-year, with the highest growth in{' '}
                <CitationInline
                  citation={createMockCitation(2, "North America")}
                  foundCitation={verification}
                />
                .
              </p>
            </div>
          </div>
        </section>

        {/* CitationMinimal */}
        <section className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4">3. CitationMinimal</h2>
          <p className="text-gray-600 mb-6">Compact citation with just number and indicator</p>

          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">VARIANTS</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Subtle:</span>
                  <CitationMinimal citation={createMockCitation(1)} foundCitation={verification} variant="subtle" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Bold:</span>
                  <CitationMinimal citation={createMockCitation(2)} foundCitation={verification} variant="bold" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Ghost:</span>
                  <CitationMinimal citation={createMockCitation(3)} foundCitation={verification} variant="ghost" />
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">SIZES</h3>
              <div className="flex items-center gap-4">
                <CitationMinimal citation={createMockCitation(1)} foundCitation={verification} size="sm" />
                <CitationMinimal citation={createMockCitation(2)} foundCitation={verification} size="default" />
                <CitationMinimal citation={createMockCitation(3)} foundCitation={verification} size="lg" />
              </div>
            </div>

            {/* In Context */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">IN CONTEXT</h3>
              <p className="text-base leading-relaxed">
                Multiple studies
                <CitationMinimal citation={createMockCitation(1)} foundCitation={verification} />
                <CitationMinimal citation={createMockCitation(2)} foundCitation={verification} />
                <CitationMinimal citation={createMockCitation(3)} foundCitation={verification} />
                {' '}have confirmed these findings.
              </p>
            </div>
          </div>
        </section>

        {/* CitationSuperscript */}
        <section className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4">4. CitationSuperscript</h2>
          <p className="text-gray-600 mb-6">Academic-style superscript citations</p>

          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">VARIANTS</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-32">Default:</span>
                  <span className="text-base">
                    Example text
                    <CitationSuperscript citation={createMockCitation(1)} foundCitation={verification} variant="default" />
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-32">Colored:</span>
                  <span className="text-base">
                    Example text
                    <CitationSuperscript citation={createMockCitation(2)} foundCitation={verification} variant="colored" />
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-32">With brackets:</span>
                  <span className="text-base">
                    Example text
                    <CitationSuperscript citation={createMockCitation(3)} foundCitation={verification} showBrackets />
                  </span>
                </div>
              </div>
            </div>

            {/* In Context */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">IN CONTEXT (ACADEMIC)</h3>
              <p className="text-base leading-relaxed">
                This phenomenon has been observed in multiple contexts
                <CitationSuperscript citation={createMockCitation(1)} foundCitation={verification} />
                and replicated across different populations
                <CitationSuperscript citation={createMockCitation(2)} foundCitation={verification} />
                <sup>,</sup>
                <CitationSuperscript citation={createMockCitation(3)} foundCitation={verification} />
                . Recent meta-analyses
                <CitationSuperscript citation={createMockCitation(4)} foundCitation={verification} />
                {' '}confirm these findings.
              </p>
            </div>
          </div>
        </section>

        {/* All States Comparison */}
        <section className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Status Color Comparison</h2>
          <p className="text-gray-600 mb-6">How each preset looks across all verification states</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 font-semibold">Preset</th>
                  <th className="py-2 px-4 font-semibold">Verified</th>
                  <th className="py-2 px-4 font-semibold">Partial</th>
                  <th className="py-2 px-4 font-semibold">Miss</th>
                  <th className="py-2 px-4 font-semibold">Pending</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Brackets</td>
                  <td className="py-3 px-4">
                    <CitationBrackets citation={createMockCitation(1)} foundCitation={mockVerifications.verified} />
                  </td>
                  <td className="py-3 px-4">
                    <CitationBrackets citation={createMockCitation(1)} foundCitation={mockVerifications.partial} />
                  </td>
                  <td className="py-3 px-4">
                    <CitationBrackets citation={createMockCitation(1)} foundCitation={mockVerifications.miss} />
                  </td>
                  <td className="py-3 px-4">
                    <CitationBrackets citation={createMockCitation(1)} foundCitation={mockVerifications.pending} />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Inline</td>
                  <td className="py-3 px-4">
                    <CitationInline citation={createMockCitation(1, "text")} foundCitation={mockVerifications.verified} />
                  </td>
                  <td className="py-3 px-4">
                    <CitationInline citation={createMockCitation(1, "text")} foundCitation={mockVerifications.partial} />
                  </td>
                  <td className="py-3 px-4">
                    <CitationInline citation={createMockCitation(1, "text")} foundCitation={mockVerifications.miss} />
                  </td>
                  <td className="py-3 px-4">
                    <CitationInline citation={createMockCitation(1, "text")} foundCitation={mockVerifications.pending} />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Minimal</td>
                  <td className="py-3 px-4">
                    <CitationMinimal citation={createMockCitation(1)} foundCitation={mockVerifications.verified} />
                  </td>
                  <td className="py-3 px-4">
                    <CitationMinimal citation={createMockCitation(1)} foundCitation={mockVerifications.partial} />
                  </td>
                  <td className="py-3 px-4">
                    <CitationMinimal citation={createMockCitation(1)} foundCitation={mockVerifications.miss} />
                  </td>
                  <td className="py-3 px-4">
                    <CitationMinimal citation={createMockCitation(1)} foundCitation={mockVerifications.pending} />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Superscript</td>
                  <td className="py-3 px-4">
                    <span className="text-base">text<CitationSuperscript citation={createMockCitation(1)} foundCitation={mockVerifications.verified} variant="colored" /></span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-base">text<CitationSuperscript citation={createMockCitation(1)} foundCitation={mockVerifications.partial} variant="colored" /></span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-base">text<CitationSuperscript citation={createMockCitation(1)} foundCitation={mockVerifications.miss} variant="colored" /></span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-base">text<CitationSuperscript citation={createMockCitation(1)} foundCitation={mockVerifications.pending} variant="colored" /></span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Code Examples */}
        <section className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">Quick Copy-Paste Examples</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-mono font-semibold mb-2">CitationBrackets</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import { CitationBrackets } from '@deepcitation/deepcitation-js/react/presets'

<CitationBrackets
  citation={citation}
  foundCitation={verification}
  size="default"
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-mono font-semibold mb-2">CitationInline</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import { CitationInline } from '@deepcitation/deepcitation-js/react/presets'

<CitationInline
  citation={{ value: "25%", citationNumber: 1 }}
  foundCitation={verification}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-mono font-semibold mb-2">Custom with Primitives</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import { Citation } from '@deepcitation/deepcitation-js/react/primitives'
import { cn } from '@deepcitation/deepcitation-js/react/utils'

<Citation.Root citation={citation} foundCitation={verification}>
  <Citation.Trigger className={cn("your-custom-classes")}>
    <Citation.Number />
    <Citation.Indicator />
  </Citation.Trigger>
</Citation.Root>`}
              </pre>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-6">
        <p>
          View the{' '}
          <a
            href="https://github.com/deepcitation/deepcitation-js/tree/main/src/react/presets"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            source code on GitHub
          </a>
          {' '}or check the{' '}
          <a
            href="https://deepcitation.github.io/deepcitation-js/"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            full documentation
          </a>
        </p>
      </div>
    </div>
  );
}
