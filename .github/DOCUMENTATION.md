# Documentation Guide

This guide explains how to write and maintain documentation for the DeepCitation JavaScript SDK.

## Overview

We use [TypeDoc](https://typedoc.org/) to automatically generate API documentation from TypeScript code and JSDoc comments. The documentation is deployed to GitHub Pages and updated automatically on every push to the main branch.

## Viewing Documentation

- **Live Documentation**: https://deepcitation.github.io/deepcitation-js/
- **Local Preview**: Run `npm run docs:serve` to generate and view docs locally

## Writing Documentation

### JSDoc Comments

All public APIs should have comprehensive JSDoc comments:

```typescript
/**
 * Brief one-line description of the function.
 *
 * More detailed explanation of what the function does, when to use it,
 * and any important considerations.
 *
 * @param paramName - Description of the parameter
 * @param anotherParam - Description with details about accepted values
 * @returns Description of what the function returns
 *
 * @example
 * ```typescript
 * // Example usage
 * const result = myFunction('example', 42);
 * console.log(result);
 * ```
 *
 * @example
 * ```typescript
 * // Another example showing different usage
 * const advanced = myFunction('advanced', { option: true });
 * ```
 *
 * @see {@link RelatedFunction} for related functionality
 * @throws {Error} Description of when this might throw
 */
export function myFunction(paramName: string, anotherParam: number): Result {
  // implementation
}
```

### Best Practices

#### 1. **Always Document Public APIs**
Every exported function, class, interface, and type should have documentation.

#### 2. **Start with a Summary**
The first line should be a concise summary that appears in listings.

#### 3. **Provide Examples**
Include at least one `@example` tag showing real-world usage. Examples should:
- Be complete and runnable
- Show common use cases
- Include imports when helpful
- Demonstrate best practices

#### 4. **Document Parameters and Returns**
- Use `@param` for each parameter with clear descriptions
- Use `@returns` to describe the return value
- Be specific about types and accepted values

#### 5. **Link Related Items**
Use `@see` tags to link to related functions, types, or external resources.

#### 6. **Note Edge Cases**
Document:
- When functions might throw errors (`@throws`)
- Important performance considerations
- Side effects
- Deprecation status (`@deprecated`)

### Interface and Type Documentation

```typescript
/**
 * Configuration options for DeepCitation client.
 *
 * @example
 * ```typescript
 * const config: DeepCitationConfig = {
 *   apiKey: process.env.DEEPCITATION_API_KEY,
 *   baseUrl: 'https://api.deepcitation.com'
 * };
 * ```
 */
export interface DeepCitationConfig {
  /**
   * Your DeepCitation API key.
   * Get one at https://deepcitation.com/api-keys
   */
  apiKey: string;

  /**
   * Base URL for the API.
   * @defaultValue 'https://api.deepcitation.com'
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @defaultValue 30000
   */
  timeout?: number;
}
```

### React Component Documentation

```typescript
/**
 * Props for the CitationComponent.
 */
export interface CitationComponentProps {
  /**
   * The citation data to display.
   */
  citation: Citation;

  /**
   * The verification result from the API.
   */
  foundCitation?: FoundHighlightLocation;

  /**
   * Whether to show the citation text value.
   * @defaultValue false
   */
  displayCitationValue?: boolean;

  /**
   * Custom className for styling.
   */
  className?: string;
}

/**
 * Displays a verified citation with visual proof.
 *
 * This component renders a citation with its verification status,
 * including visual highlighting of the source text when available.
 *
 * @example
 * ```tsx
 * import { CitationComponent } from '@deepcitation/deepcitation-js/react';
 *
 * function MyComponent() {
 *   return (
 *     <CitationComponent
 *       citation={citation}
 *       foundCitation={verificationResult}
 *       displayCitationValue={true}
 *     />
 *   );
 * }
 * ```
 */
export function CitationComponent(props: CitationComponentProps) {
  // implementation
}
```

### Module-Level Documentation

Add package-level documentation to `index.ts`:

```typescript
/**
 * DeepCitation JavaScript SDK
 *
 * This package provides citation verification and parsing for AI-generated content.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { DeepCitation, wrapSystemCitationPrompt } from '@deepcitation/deepcitation-js';
 *
 * const client = new DeepCitation({ apiKey: 'your-key' });
 * ```
 *
 * ## Main Features
 *
 * - Citation extraction from LLM output
 * - Citation verification against source documents
 * - Visual proof generation
 * - React components for displaying citations
 *
 * @packageDocumentation
 */
```

## Documentation Categories

TypeDoc organizes documentation by categories. Use JSDoc tags to categorize:

```typescript
/**
 * Parse a citation from text.
 *
 * @category Parsing
 */
export function parseCitation() { }

/**
 * Citation verification options.
 *
 * @category Types
 */
export interface VerifyOptions { }
```

## Building Documentation

### Local Development

```bash
# Generate docs once
npm run docs

# Generate docs in watch mode (rebuilds on file changes)
npm run docs:watch

# Generate and serve docs locally
npm run docs:serve
```

### Automated Deployment

Documentation is automatically built and deployed to GitHub Pages when:
- Changes are pushed to the `main` branch
- Changes affect source files, README, or TypeDoc config
- Manually triggered via GitHub Actions

## Updating Documentation

1. **Add/Update JSDoc comments** in your TypeScript files
2. **Test locally**: Run `npm run docs:serve` to preview
3. **Commit changes**: Documentation updates deploy automatically
4. **Verify deployment**: Check GitHub Actions for successful deployment

## Documentation Structure

The generated documentation includes:

- **README**: Overview and getting started
- **API Reference**: All exported types, functions, and classes
- **Examples**: Code examples from JSDoc comments
- **Search**: Full-text search across all documentation
- **Source Links**: Links back to source code on GitHub

## Tips

### Use Markdown in JSDoc

JSDoc supports Markdown formatting:

```typescript
/**
 * Process citations from LLM output.
 *
 * **Important**: This function normalizes citations before processing.
 *
 * Supported formats:
 * - Standard XML-style citations
 * - Legacy JSON citations
 * - Audio/Video timestamp citations
 *
 * See the [API docs](https://api.deepcitation.com) for details.
 */
```

### Group Related Exports

Use `@group` to organize exports:

```typescript
/**
 * @group Client
 */
export class DeepCitation { }

/**
 * @group Client
 */
export interface DeepCitationConfig { }
```

### Hide Internal APIs

Use `@internal` to hide implementation details:

```typescript
/**
 * @internal
 */
export function internalHelper() { }
```

### Mark Deprecated APIs

```typescript
/**
 * @deprecated Use {@link newFunction} instead. Will be removed in v2.0.0.
 */
export function oldFunction() { }
```

## Questions?

If you have questions about documentation:
- Check the [TypeDoc documentation](https://typedoc.org/guides/overview/)
- Look at existing well-documented functions as examples
- Ask in pull request reviews

## Maintaining Quality

Good documentation:
- ✅ Explains **why** and **when** to use something, not just what it does
- ✅ Includes practical examples
- ✅ Links to related functionality
- ✅ Notes edge cases and gotchas
- ✅ Uses clear, concise language
- ✅ Keeps code examples up-to-date

Poor documentation:
- ❌ Just repeats the function name
- ❌ No examples
- ❌ Vague parameter descriptions
- ❌ Missing important details
- ❌ Outdated information
