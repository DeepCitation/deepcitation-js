# Quick Reference: Package Upgrade Status

## TL;DR - Can I upgrade?

| Package | Current | Target | Safe? | Notes |
|---------|---------|--------|-------|-------|
| @types/jest | 29.5.14 | 30.0.0 | ✅ YES | Pure types, no risk |
| @types/node | 24.10.13 | 25.2.3 | ✅ YES | Pure types, no risk |
| @vitejs/plugin-react | 4.7.0 | 5.1.4 | ✅ YES | No breaking changes |
| jest | 29.7.0 | 30.2.0 | ⚠️ MAYBE | Matcher names changed, needs testing |
| jest-environment-jsdom | 29.7.0 | 30.2.0 | ⚠️ MAYBE | jsdom v26 behavior changes, needs testing |
| @jest/globals | 29.7.0 | 30.2.0 | ⚠️ PROBABLY | Type changes only, verify no SpyInstance usage |
| size-limit | 11.2.0 | 12.0.0 | ⚠️ PROBABLY | Dep removal, should work fine, test it |
| @size-limit/preset-small-lib | 11.2.0 | 12.0.0 | ⚠️ PROBABLY | Upgrade with size-limit |
| rimraf | 5.0.10 | 6.1.2 | ⚠️ DON'T | Needs Node >=20, your project allows Node 18 |

## What Will Break?

### ✅ Won't Break Anything (Safe to upgrade now)
- `@types/jest`, `@types/node`, `@vitejs/plugin-react`

### ⚠️ Might Break - Needs Testing
- **jest 29→30**: Old matcher names no longer work
  - Example: `toBeCalled()` → must use `toHaveBeenCalled()`
  - Your code: Using vitest in examples, regular tests not found
  - Action: Run full test suite, should be fine

- **jest-environment-jsdom 29→30**: DOM behavior might change
  - Example: jsdom version jump (21→26) = 5 years of changes
  - Your code: Uses happy-dom primarily, not jsdom
  - Action: Run full test suite, should be fine

- **@jest/globals 29→30**: Removed some type names
  - Example: `SpyInstance` is gone, use `jest.Spied` instead
  - Your code: Uses vitest, not these types
  - Action: Grep for `SpyInstance`, probably nothing to fix

- **size-limit 11→12**: Removed chokidar dependency
  - Example: Uses fs.watch instead of chokidar
  - Your code: Just runs size checks, no custom watching
  - Action: Run `npm run size` after upgrade, should work

### ❌ Don't Upgrade (Breaking compatibility)
- **rimraf 5→6**: Requires Node.js >= 20
  - Your project: Allows Node >= 18
  - Impact: Would break on Node 18.x and 19.x
  - Action: Skip this one, or update Node requirement first

## Testing Checklist

After upgrading, run these commands:

```bash
# Build everything
npm run build

# Run all tests
npm run test:jest           # Jest tests
npm run test:ct            # Component tests

# Check code quality
npm run lint

# Verify bundle sizes
npm run size
npm run analyze
```

## My Recommendation

### ✅ DO UPGRADE IMMEDIATELY (Safe)
```bash
npm install --save-dev \
  @types/jest@30.0.0 \
  @types/node@25.2.3 \
  @vitejs/plugin-react@5.1.4
```

### ⚠️ PLAN TO UPGRADE (Test required)
Upgrade Jest, jsdom, and size-limit together:
```bash
npm install --save-dev \
  jest@30.2.0 \
  jest-environment-jsdom@30.2.0 \
  @jest/globals@30.2.0 \
  size-limit@12.0.0 \
  @size-limit/preset-small-lib@12.0.0
```

Then run full test suite:
```bash
npm run build && npm run test:jest && npm run test:ct && npm run size
```

### ❌ SKIP FOR NOW (Incompatible)
```bash
# Do NOT upgrade rimraf 5 → 6 yet
# Requires Node.js >= 20, your project allows >= 18
```

## If Tests Fail

### Jest matcher errors
Look for old names in tests:
```bash
grep -r "toBeCalled\|toBeCalledWith\|toReturn" src/
```

Replace with new names:
- `toBeCalled()` → `toHaveBeenCalled()`
- `toBeCalledWith()` → `toHaveBeenCalledWith()`
- etc.

### DOM test failures
jsdom version changed (21→26). Likely just version differences.
- Check jsdom [release notes](https://github.com/jsdom/jsdom/blob/main/Changelog.md)
- Update test expectations if needed

### Size-limit failures
If `npm run size` fails:
```bash
npm run analyze
# Shows which files grew and why
```

Might have bundle size increases. Acceptable if intentional.

## Bottom Line

- **Safe upgrades**: 3 packages, do it now
- **Probably safe**: 5 packages, need to test
- **Risky**: 1 package (rimraf), skip it
- **Time estimate**: 1-2 hours for full testing cycle

Your codebase looks well-maintained. Unlikely to hit issues with Jest/jsdom upgrades since you're using vitest for examples.
