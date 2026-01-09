# Contributing to DeepCitation

Thank you for your interest in contributing to DeepCitation! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Push to your fork and submit a pull request

## Development Setup

### Prerequisites

- Node.js >= 22
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/deepcitation/deepcitation-js.git
cd deepcitation-js

# Install dependencies
npm install
# or
yarn install
# or
bun install
```

### Available Scripts

- `npm run build` - Build the package
- `npm run build:watch` - Build in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run unit tests with Bun
- `npm run test:jest` - Run unit tests with Jest
- `npm run test:watch` - Run Jest tests in watch mode
- `npm run test:ct` - Run Playwright component tests
- `npm run test:ct:ui` - Run Playwright tests with UI

## Development Workflow

1. **Create a branch** from `main` for your work:
   ```bash
   git checkout -b feature/my-new-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes**:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   npm test
   npm run test:ct
   ```

4. **Commit your changes** with a descriptive commit message

5. **Push to your fork** and create a pull request

## Testing

All code changes should include appropriate tests:

- **Unit tests**: For individual functions and components
- **Component tests**: For React components using Playwright
- **Type tests**: Ensure TypeScript types are correct

### Running Tests

```bash
# Run all unit tests
npm test

# Run Jest tests
npm run test:jest

# Run component tests
npm run test:ct

# Run tests in watch mode (for development)
npm run test:watch
```

### Writing Tests

- Place test files in `src/__tests__/`
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies when appropriate

## Code Style

We use ESLint and TypeScript for code quality:

- Run `npm run lint` to check for issues
- Run `npm run lint:fix` to automatically fix issues
- Follow the existing code style in the project
- Use TypeScript strict mode
- Add JSDoc comments for public APIs

### Key Conventions

- Use descriptive variable and function names
- Keep functions small and focused
- Avoid `any` types when possible
- Use const by default, let when necessary
- No console.logs in production code
- Handle errors appropriately

## Commit Messages

We follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```
feat(parsing): add support for footnote citations

fix(react): resolve citation component rendering issue

docs: update installation instructions

test(client): add tests for API error handling
```

## Pull Request Process

1. **Update documentation** if you've changed APIs or added features
2. **Add tests** for any new functionality
3. **Ensure all tests pass** and the build succeeds
4. **Update the README** if needed
5. **Fill out the PR template** completely
6. **Request review** from maintainers
7. **Address review feedback** promptly

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's code style
- [ ] Tests pass locally (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] PR description is clear and complete

## Release Process

Releases are managed by maintainers:

1. Version bump in `package.json`
2. Update `CHANGELOG.md`
3. Create a GitHub release
4. Automated CD workflow publishes to npm

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

## Questions?

If you have questions or need help:

- Open an issue for bugs or feature requests
- Check existing issues and discussions
- Reach out to maintainers

Thank you for contributing to DeepCitation!
