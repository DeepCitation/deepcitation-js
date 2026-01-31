---
layout: default
title: Contributing
nav_exclude: true
search_exclude: true
---

# Contributing to Documentation

Thank you for your interest in improving the DeepCitation documentation.

## Getting Started

### Prerequisites

- Ruby 3.2+
- Bundler

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/DeepCitation/deepcitation-js.git
   cd deepcitation-js/docs
   ```

2. Install dependencies:
   ```bash
   bundle install
   ```

3. Start the local server:
   ```bash
   bundle exec jekyll serve
   ```

4. Open [http://localhost:4000/deepcitation-js/](http://localhost:4000/deepcitation-js/) in your browser.

## Documentation Structure

```
docs/
├── _config.yml           # Jekyll configuration
├── index.md              # Home page
├── getting-started.md    # Installation guide
├── api-reference.md      # REST API docs
├── curl-guide.md         # Curl examples
├── types.md              # TypeScript interfaces
├── verification-statuses.md  # Status explanations
├── code-examples.md      # SDK usage patterns
├── components.md         # React component docs
├── real-world-examples.md    # Industry examples
├── styling.md            # CSS customization
└── 404.md                # 404 page
```

## Writing Guidelines

### Front Matter

Every markdown file needs front matter:

```yaml
---
layout: default
title: Page Title
nav_order: 1
description: "Brief description for SEO"
---
```

### Code Examples

Use fenced code blocks with language tags:

````markdown
```typescript
const dc = new DeepCitation({ apiKey: "..." });
```
````

### Callouts

Use just-the-docs callouts:

```markdown
{: .note }
This is a note.

{: .warning }
This is a warning.

{: .highlight }
This is highlighted.
```

### Links

Link to other pages without the `.md` extension:

```markdown
[Getting Started](getting-started)
```

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b docs/my-improvement`
3. Make your changes
4. Test locally with `bundle exec jekyll serve`
5. Commit: `git commit -m "docs: Description of changes"`
6. Push and create a pull request

## Questions?

Open an issue or reach out at [support@deepcitation.com](mailto:support@deepcitation.com).
