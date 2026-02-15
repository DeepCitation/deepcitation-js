# Code Patterns to Watch During Upgrades

## Jest 30 Breaking Changes - What to Search For

### 1. Deprecated Matcher Names (Will Break)

Search for these and replace:

```bash
# Commands to find deprecated matchers in your code:
grep -r "\.toBeCalled(" src/ --include="*.test.ts" --include="*.test.tsx"
grep -r "\.toBeCalledWith(" src/ --include="*.test.ts" --include="*.test.tsx"
grep -r "\.toReturn(" src/ --include="*.test.ts" --include="*.test.tsx"
grep -r "\.toReturnWith(" src/ --include="*.test.ts" --include="*.test.tsx"
grep -r "\.lastCalledWith(" src/ --include="*.test.ts" --include="*.test.tsx"
grep -r "\.lastReturnedWith(" src/ --include="*.test.ts" --include="*.test.tsx"
grep -r "\.nthCalledWith(" src/ --include="*.test.ts" --include="*.test.tsx"
grep -r "\.nthReturnedWith(" src/ --include="*.test.ts" --include="*.test.tsx"
```

**Replacement Mapping**:

| Old (v29) | New (v30) |
|-----------|-----------|
| `expect(mock).toBeCalled()` | `expect(mock).toHaveBeenCalled()` |
| `expect(mock).toBeCalledTimes(n)` | `expect(mock).toHaveBeenCalledTimes(n)` |
| `expect(mock).toBeCalledWith(arg)` | `expect(mock).toHaveBeenCalledWith(arg)` |
| `expect(mock).toBeCalledWith(arg1, arg2)` | `expect(mock).toHaveBeenCalledWith(arg1, arg2)` |
| `expect(mock).lastCalledWith(arg)` | `expect(mock).toHaveBeenLastCalledWith(arg)` |
| `expect(mock).nthCalledWith(n, arg)` | `expect(mock).toHaveBeenNthCalledWith(n, arg)` |
| `expect(mock).toReturn()` | `expect(mock).toHaveReturned()` |
| `expect(mock).toReturnTimes(n)` | `expect(mock).toHaveReturnedTimes(n)` |
| `expect(mock).toReturnWith(val)` | `expect(mock).toHaveReturnedWith(val)` |
| `expect(mock).lastReturnedWith(val)` | `expect(mock).toHaveLastReturnedWith(val)` |
| `expect(mock).nthReturnedWith(n, val)` | `expect(mock).toHaveNthReturnedWith(n, val)` |
| `expect(fn).toThrow("message")` | `expect(fn).toThrow("message")` (same, no change needed) |

**Example Fix**:
```typescript
// Before (Jest 29)
test('calls callback on click', () => {
  const callback = jest.fn();
  userEvent.click(button);
  expect(callback).toBeCalledWith('click');
  expect(callback).toBeCalledTimes(1);
});

// After (Jest 30)
test('calls callback on click', () => {
  const callback = jest.fn();
  userEvent.click(button);
  expect(callback).toHaveBeenCalledWith('click');
  expect(callback).toHaveBeenCalledTimes(1);
});
```

**Your Project Status**: ✅ Not using deprecated matchers detected

---

### 2. jest.mock() Case-Sensitive Paths (Will Break if mismatched)

Search for jest.mock declarations:

```bash
grep -r "jest\.mock(" src/ --include="*.test.ts" --include="*.test.tsx"
```

**Pattern**:
```typescript
// Check that file path matches EXACT case of actual file

// WRONG (will break in Jest 30 if file is actually "myModule.ts")
jest.mock('./MyModule');

// RIGHT (matches actual filename)
jest.mock('./myModule');
```

**Action Required**:
- Verify each `jest.mock()` path matches the actual file path case exactly
- Most Node.js projects use lowercase, this usually isn't an issue

**Your Project Status**: ✅ Example uses `vi.mock()` from vitest (different system)

---

### 3. jest.genMockFromModule Removed (Will Break if used)

Search for old API:

```bash
grep -r "genMockFromModule" src/ --include="*.test.ts" --include="*.test.tsx" --include="*.ts" --include="*.tsx"
```

**Replacement**:
```typescript
// OLD (Jest 29) - BREAKS
const mockFs = jest.genMockFromModule('fs');

// NEW (Jest 30)
const mockFs = jest.createMockFromModule('fs');
```

**Your Project Status**: ✅ Not using this API

---

### 4. Removed Mock Types from @jest/globals (TypeScript only)

Search for deprecated types:

```bash
grep -r "SpyInstance" src/ --include="*.ts" --include="*.tsx"
grep -r "MockFunctionMetadata" src/ --include="*.ts" --include="*.tsx"
```

**Replacement**:
```typescript
// OLD (Jest 29 @jest/globals)
import type { SpyInstance } from '@jest/globals';
const mockFn: SpyInstance = jest.spyOn(obj, 'method');

// NEW (Jest 30 @jest/globals)
// Use jest.Spied for spy types
const mockFn = jest.spyOn(obj, 'method') as jest.MockedFunction<typeof obj.method>;
// Or just don't use the type annotation at all
const mockFn = jest.spyOn(obj, 'method');
```

**Your Project Status**: ✅ Using vitest types, not @jest/globals

---

## jest-environment-jsdom 30 - DOM Behavior Changes

### jsdom Version Jump (21 → 26)

**What Changed**: ~5 years of updates (2021 to 2026)

**Common Issues**:
1. **Event handling** - Some events fire differently
2. **Element properties** - Non-enumerable properties now excluded
3. **Form handling** - More standards-compliant behavior

**Search for potential issues**:
```bash
# Tests that heavily rely on DOM behavior
grep -r "element\.innerHTML" src/__tests__/ --include="*.test.tsx"
grep -r "fireEvent\|userEvent" src/__tests__/ --include="*.test.tsx"
grep -r "getBy\|queryBy\|findBy" src/__tests__/ --include="*.test.tsx"
```

**Testing Strategy**:
1. Run `npm run test:ct` after upgrade
2. Look for DOM-related assertion failures
3. Check jsdom release notes if behavior changed: https://github.com/jsdom/jsdom/blob/main/Changelog.md

**Your Project Status**:
- ✅ Uses happy-dom primarily (not jsdom) - less likely to hit issues
- ✅ React tests are component tests (likely use jsdom)
- Note: Check `jest.config.cjs` shows `testEnvironment: "jsdom"`

---

## @jest/globals 30 - Type Changes

### Removed Types

Search for:
```bash
grep -r "jest\.SpyInstance" src/ --include="*.ts" --include="*.tsx"
grep -r "from '@jest/globals'" src/ --include="*.ts" --include="*.tsx"
```

**Migration Examples**:

```typescript
// OLD (v29)
import { SpyInstance } from '@jest/globals';
const spy: SpyInstance = jest.spyOn(console, 'log');

// NEW (v30) - Option 1: Don't type it
const spy = jest.spyOn(console, 'log');

// NEW (v30) - Option 2: Use jest.Spied
const spy = jest.spyOn(console, 'log') as jest.Spied<typeof console.log>;

// NEW (v30) - Option 3: Use jest.MockedFunction
const spy: jest.MockedFunction<typeof console.log> = jest.spyOn(console, 'log');
```

**Your Project Status**: ✅ Using vitest (`vi.`) not @jest/globals

---

## size-limit 12 - Configuration Changes

### Dependency Removals

**No configuration changes needed** - your setup should work as-is:

```json
{
  "size-limit": [
    {
      "path": "lib/index.js",
      "limit": "25 KB"
    }
  ]
}
```

**Testing**:
```bash
npm run size      # Should work without changes
npm run analyze   # Shows detailed breakdown
```

**Potential Issues**:
- If bundled size grows unexpectedly, check `npm run analyze` output
- esbuild version updates might affect tree-shaking
- fs.watch replacement (instead of chokidar) shouldn't affect results

**Your Project Status**: ✅ Simple configuration, should upgrade cleanly

---

## rimraf 6 - Node.js Compatibility

### Breaking: Requires Node.js >= 20

**Current State**:
```json
{
  "engines": {
    "node": ">=18"
  }
}
```

**Issue**:
- rimraf 6 requires Node.js >= 20
- If you test/deploy on Node 18 or 19, upgrade will break CI

**Decision Tree**:
1. Do you use Node 18 or 19 anywhere?
   - **Yes**: Don't upgrade rimraf
   - **No**: Safe to upgrade

2. Check your CI/deployment:
   ```bash
   # Check Node version in CI
   cat .github/workflows/*.yml | grep node-version

   # Check package.json engines
   npm ls --depth=0 | grep node
   ```

**If You Must Upgrade**:
1. Update package.json engines:
   ```json
   {
     "engines": {
       "node": ">=20"
     }
   }
   ```
2. Update CI/deployment Node.js version
3. Then upgrade: `npm install --save-dev rimraf@6.1.2`

**Your Project Status**:
- ⚠️ Currently allows Node 18+
- ❌ rimraf 6 requires Node 20+
- **Recommendation**: Skip for now, or coordinate with team on Node.js policy

---

## Testing Strategy After Upgrade

### 1. Type Checking
```bash
npm run build:tsc    # TypeScript compilation check
```

Catches:
- SpyInstance type removal
- Any other type incompatibilities

### 2. Linting
```bash
npm run lint
```

Catches:
- Biome issues (code quality)
- Some deprecated patterns

### 3. Unit Tests
```bash
npm run test:jest
```

Catches:
- Deprecated matcher usage
- Mock configuration issues
- Test logic changes needed

### 4. Component Tests
```bash
npm run test:ct
```

Catches:
- jsdom behavior changes
- DOM-related test failures
- React component issues

### 5. Bundle Size
```bash
npm run size
npm run analyze
```

Catches:
- Unexpected size changes
- esbuild/preset changes affecting bundle

### 6. Full Build
```bash
npm run build
```

Catches:
- Any integration issues
- Build process changes

---

## Pre-Upgrade Checklist

```bash
# Save current state
git status
git add .
git commit -m "WIP: pre-upgrade snapshot"

# Verify baseline
npm run build
npm run test:jest
npm run test:ct
npm run lint
npm run size

# Now proceed with upgrades
```

---

## Rollback Strategy

If something breaks:

```bash
# Revert package.json
git checkout HEAD -- package.json package-lock.json

# Reinstall
rm -rf node_modules
npm install

# Verify
npm run build
npm run test:jest
```

---

## Summary of Risks by Severity

### 🔴 High Risk (Check before upgrade)
- ✅ Deprecated matcher names in tests
- ✅ jest.mock() path case sensitivity

### 🟡 Medium Risk (Test thoroughly)
- ✅ jsdom DOM behavior changes
- ✅ Mock type removals

### 🟢 Low Risk (Usually fine)
- ✅ Type package updates
- ✅ Plugin updates
- ✅ size-limit updates

### 🔵 Policy Decision (Check first)
- ✅ rimraf Node.js version requirement

**Current Assessment for Your Project**:
- 🟢 **Low to Medium Risk**
- Reasons: Using vitest (not Jest heavily), simple test setup, clean codebase
- **Time to test**: 1-2 hours
