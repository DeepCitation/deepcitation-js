/**
 * Citation Presets - Pre-built Tailwind-styled Components
 *
 * This module exports ready-to-use citation components styled with Tailwind CSS.
 * These components are built on top of the citation primitives and provide
 * common styling patterns out of the box.
 *
 * ## Available Presets
 *
 * - **CitationBrackets** - Classic bracketed style `[1✓]`
 * - **CitationInline** - Inline text with indicator `text✓`
 * - **CitationMinimal** - Compact number and indicator `1✓`
 * - **CitationSuperscript** - Academic superscript style `¹`
 *
 * ## Usage
 *
 * ```tsx
 * import { CitationBrackets } from '@deepcitation/deepcitation-js/react/presets'
 *
 * <CitationBrackets
 *   citation={citation}
 *   foundCitation={verification}
 * />
 * ```
 *
 * ## Customization
 *
 * All presets accept className props for customization:
 *
 * ```tsx
 * <CitationBrackets
 *   className="my-custom-class"
 *   triggerClassName="hover:scale-110"
 * />
 * ```
 *
 * ## Building Your Own
 *
 * Need full control? Use the primitives instead:
 *
 * ```tsx
 * import { Citation } from '@deepcitation/deepcitation-js/react/primitives'
 *
 * <Citation.Root citation={citation}>
 *   <Citation.Trigger className="your-custom-styles">
 *     {// Your custom composition}
 *   </Citation.Trigger>
 * </Citation.Root>
 * ```
 *
 * @packageDocumentation
 */

export { CitationBrackets, type CitationBracketsProps } from "./citation-brackets.js";
export { CitationInline, type CitationInlineProps } from "./citation-inline.js";
export { CitationMinimal, type CitationMinimalProps } from "./citation-minimal.js";
export { CitationSuperscript, type CitationSuperscriptProps } from "./citation-superscript.js";
