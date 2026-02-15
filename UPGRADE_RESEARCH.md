# Package Upgrade Safety Research Report

**Project**: @deepcitation/deepcitation-js
**Current Node Version**: >=18
**Current TypeScript**: ^5.9.3
**Date**: February 15, 2026

---

## Executive Summary

This research analyzes 9 proposed package upgrades: 3 safe minor bumps and 6 potentially risky major version bumps. The major version upgrades have breaking changes that may or may not require code modifications depending on your current usage patterns.

**Key Finding**: Your project can safely upgrade most packages, but Jest 30 requires attention due to matcher name changes and potential DOM environment behavior changes.

---

## SAFE UPGRADES (Minor Version Bumps)

### 1. @types/jest: 29.5.14 → 30.0.0
**Status**: ✅ SAFE - Minor type update
**Breaking Changes**: None
**Code Changes Required**: No

**Details**:
- Pure type definition package
- No behavioral changes to Jest itself
- TypeScript type improvements for mock functions
- Will provide better type inference for mocks
- No configuration changes needed

**Recommendation**: **Safe to upgrade immediately**

---

### 2. @types/node: 24.10.13 → 25.2.3
**Status**: ✅ SAFE - Minor type update
**Breaking Changes**: None
**Code Changes Required**: No

**Details**:
- Pure type definition package
- Aligns with Node.js 25.x type definitions
- Your project already targets Node >=18, so compatible
- No behavioral changes

**Recommendation**: **Safe to upgrade immediately**

---

### 3. @vitejs/plugin-react: 4.7.0 → 5.1.4
**Status**: ✅ SAFE - Minor bump
**Breaking Changes**: None material
**Code Changes Required**: No

**Details**:
- No significant breaking changes between v4 and v5
- Generic parameter on Plugin was removed (type safety improvement)
- SSR preamble import option added (optional, not required)
- `@vitejs/plugin-react-oxc` is deprecated (you don't use it)

**Recommendation**: **Safe to upgrade immediately**

---

## UNSAFE UPGRADES (Major Version Bumps) - Requires Review

### 4. jest: 29.7.0 → 30.2.0
**Status**: ⚠️ BREAKING CHANGES - Requires code inspection
**Breaking Changes**: Yes (multiple)
**Code Changes Required**: Likely

**Critical Node.js Requirement**:
- **Drops support for Node 14, 16, 19, and 21**
- Minimum: Node 18.x (your project already requires >=18, so OK ✓)

**Critical TypeScript Requirement**:
- **Minimum TypeScript: 5.4** (you have ^5.9.3, so OK ✓)

**Breaking Changes Requiring Code Inspection**:

1. **Jest Mock API - `genMockFromModule` Removed**
   ```javascript
   // OLD (v29) - WILL BREAK
   const mockFs = jest.genMockFromModule('fs');

   // NEW (v30)
   const mockFs = jest.createMockFromModule('fs');
   ```
   - Action: Search codebase for `genMockFromModule`
   - Your tests: None found

2. **Deprecated Matcher Aliases Removed**
   - Jest 29 aliases: `toBeCalled()`, `toReturn()`, etc.
   - Jest 30 requires: `toHaveBeenCalled()`, `toHaveReturned()`, etc.
   - Full list of replacements available in Jest 30 docs
   - Action: Search for deprecated aliases in test files
   - Your tests: Using vitest (not Jest) in example, so not affected directly

3. **Case-Sensitive Module Paths**
   ```javascript
   // OLD (v29) - Works even if file is filename.js
   jest.mock('./path/to/FILENAME.js');

   // NEW (v30) - Must match exact case
   jest.mock('./path/to/filename.js');
   ```
   - Action: Review jest.mock() calls
   - Your tests: Need to verify

4. **Non-Enumerable Properties Excluded from Matchers**
   - `expect.objectContaining()` now ignores non-enumerable properties
   - Action: Check if tests rely on non-enumerable property matching
   - Your tests: Need to verify

5. **jsdom Upgrade: v21 → v26**
   - jest-environment-jsdom will use jsdom 26
   - May introduce DOM behavior changes
   - Action: Test your React component tests thoroughly
   - Your tests: Using happy-dom primarily, not jsdom directly

**CLI Changes** (not code-affecting):
- `jest.mock()` case-sensitive paths now enforced
- `--testPathPattern` changed to `--testPathPatterns` (config, not code)

**Recommendation**:
- ⚠️ **PROCEED WITH CAUTION**
- Requires: Full test suite run to verify
- Requires: Search for deprecated matcher aliases
- Requires: Verify jest.mock() paths use correct case
- Estimated effort: 1-2 hours for verification + fixes (if needed)

---

### 5. jest-environment-jsdom: 29.7.0 → 30.2.0
**Status**: ⚠️ BREAKING CHANGES - jsdom v21→v26
**Breaking Changes**: Potential DOM behavior changes
**Code Changes Required**: Unlikely, but test verification needed

**Critical Change**:
- Upgrades jsdom from v21 to v26
- Your project uses `testEnvironment: "jsdom"` in jest.config.cjs
- jsdom 26 may have DOM API behavior differences
- Previous jsdom versions (21→26) includes ~5 years of changes

**Notable jsdom v26 Changes**:
- Improved Web API standards compliance
- Some DOM methods may behave differently
- Web Storage behavior updates
- Error handling improvements

**Recommendation**:
- ⚠️ **CONDITIONAL UPGRADE**
- Pair with Jest 30 upgrade (not separate)
- Run full test suite to catch any DOM behavior differences
- If tests pass, safe to keep upgrade
- Estimated effort: Test verification only (no code changes expected)

---

### 6. @jest/globals: 29.7.0 → 30.2.0
**Status**: ⚠️ BREAKING CHANGES - Type removals
**Breaking Changes**: Yes (type-only)
**Code Changes Required**: Only if using deprecated types

**Breaking Type Changes**:
```typescript
// Removed types (v29 → v30)
// - MockFunctionMetadata (REMOVED)
// - MockFunctionMetadataType (REMOVED)
// - SpyInstance (REMOVED)

// Replacement
import { describe, expect, it, vi } from "vitest";
// OR use jest.Mock<> instead of jest.SpyInstance
```

**Your Project**:
- Your test uses `vi` from vitest (not @jest/globals)
- Example test doesn't use removed types
- Action: Search for `SpyInstance`, `MockFunctionMetadata` usage
- Your tests: Likely not affected

**Recommendation**:
- ⚠️ **SAFE IF NO SPYINSTANCE USAGE**
- Search codebase for: `SpyInstance`, `MockFunctionMetadata`
- If found: Replace with `jest.Spied` or `jest.Mock`
- Estimated effort: 15-30 minutes if cleanup needed

---

### 7. size-limit: 11.2.0 → 12.0.0
**Status**: ⚠️ POTENTIAL ISSUES - Dependency removal
**Breaking Changes**: Yes (dependency-related)
**Code Changes Required**: Unlikely, but possible

**Breaking Changes**:

1. **Node.js 18 Dropped**
   - size-limit 12.0.0 requires Node.js >= 19
   - Your project requires Node >= 18
   - ✅ You have Node >= 18, so compatible with latest LTS versions

2. **chokidar Removed**
   - Replaced with native `fs.watch`
   - If you have chokidar as sibling dependency, no impact
   - If you relied on chokidar watching behavior, may notice differences

3. **jiti Moved to Optional Dependency**
   - Reduces package size
   - You don't directly use jiti
   - No impact to your build

4. **esbuild Updated**
   - Used internally by size-limit
   - Your project uses esbuild 0.27.3 directly
   - Check compatibility (esbuild is forward-compatible)

**Your Current Setup**:
```json
"size-limit": "^11.2.0",
"@size-limit/preset-small-lib": "^11.2.0",
"esbuild": "0.27.3"
```

**Impact Analysis**:
- Your size-limit configuration in package.json (lines 103-120) is simple
- Uses `preset-small-lib` preset
- No custom watch configuration or jiti usage detected

**Recommendation**:
- ⚠️ **PROCEED WITH TESTING**
- Upgrade should work without code changes
- Run `npm run size` after upgrade to verify
- Run `npm run analyze` to check for unexpected size changes
- Estimated effort: 10 minutes (run tests)

---

### 8. @size-limit/preset-small-lib: 11.2.0 → 12.0.0
**Status**: ⚠️ SAME AS size-limit above
**Breaking Changes**: Same as #7
**Code Changes Required**: No (preset is declarative)

**Details**:
- Must be upgraded together with size-limit (same version)
- No configuration changes needed in your setup
- Preset includes: esbuild, brotli, and other optimization tools

**Recommendation**:
- ⚠️ **UPGRADE TOGETHER WITH size-limit**
- No separate issues
- Refer to size-limit migration steps

---

### 9. rimraf: 5.0.10 → 6.1.2
**Status**: ⚠️ BREAKING CHANGES - Node.js requirement
**Breaking Changes**: Yes (Node.js version)
**Code Changes Required**: Unlikely (not directly used)

**Breaking Changes**:

1. **Node.js 20 Minimum Requirement**
   - rimraf 6.x requires Node.js >= 20
   - Your project requires Node >= 18
   - ❌ **INCOMPATIBILITY**: If you run on Node 18 or 19, this breaks

2. **API Changes from v5 (Already Applied)**
   - v5 removed default export (you should already be using named imports)
   - v6 continues this pattern

**Your Usage Analysis**:
- rimraf is used in package.json build script: `"build:tsc": "rm -rf lib && bun ./node_modules/typescript/bin/tsc"`
- Actually uses shell `rm -rf`, NOT rimraf module
- rimraf is a dev dependency but likely not directly imported in code

**Action Needed**:
1. Search codebase for `import * from 'rimraf'` or `require('rimraf')`
2. Check if any build scripts directly invoke rimraf CLI
3. Verify Node.js version targets for your deployment/testing

**Recommendation**:
- ⚠️ **CONDITIONAL ON NODE VERSION POLICY**
- If your CI/deployment uses Node 18-19: **DO NOT UPGRADE**
- If Node >= 20 guaranteed: Safe to upgrade
- Check your CI configuration and deployment targets
- Estimated effort: 5 minutes (version audit)

---

## Summary Table

| Package | Version | Type | Risk | Code Changes | Recommendation |
|---------|---------|------|------|--------------|-----------------|
| @types/jest | 29→30 | Minor | ✅ None | No | ✅ Upgrade |
| @types/node | 24→25 | Minor | ✅ None | No | ✅ Upgrade |
| @vitejs/plugin-react | 4→5 | Minor | ✅ None | No | ✅ Upgrade |
| jest | 29→30 | Major | ⚠️ High | Possible | ⚠️ Test first |
| jest-environment-jsdom | 29→30 | Major | ⚠️ Medium | Unlikely | ⚠️ Test suite |
| @jest/globals | 29→30 | Major | ⚠️ Low | Unlikely | ⚠️ Search types |
| size-limit | 11→12 | Major | ⚠️ Low | No | ⚠️ Run tests |
| @size-limit/preset-small-lib | 11→12 | Major | ⚠️ Low | No | ⚠️ Run tests |
| rimraf | 5→6 | Major | ⚠️ High | Unlikely | ⚠️ Verify Node.js |

---

## Recommended Upgrade Path

### Phase 1: Safe Upgrades (No Risk)
Do these first:
```bash
npm install --save-dev @types/jest@30.0.0 @types/node@25.2.3 @vitejs/plugin-react@5.1.4
```

### Phase 2: Test Jest 30 Upgrade
Critical path - test thoroughly:
```bash
npm install --save-dev jest@30.2.0 @jest/globals@30.2.0 jest-environment-jsdom@30.2.0
npm run test:jest
npm run test:ct
```

**Must verify**:
- [ ] All Jest tests pass
- [ ] No deprecated matcher usage found
- [ ] jest.mock() paths use correct case
- [ ] Component tests (jsdom environment) work correctly

### Phase 3: Tool Upgrades
Less critical, test after Phase 2:
```bash
npm install --save-dev size-limit@12.0.0 @size-limit/preset-small-lib@12.0.0
npm run size
npm run analyze
```

### Phase 4: rimraf Upgrade
Only if Node version >= 20 is guaranteed:
```bash
npm install --save-dev rimraf@6.1.2
```

---

## Detailed Action Checklist

### Before Any Upgrades
- [ ] Current Node version: `node --version` (verify >= 18)
- [ ] Current npm version: `npm --version`
- [ ] All tests passing: `npm run test:jest && npm run test:ct`
- [ ] Build working: `npm run build`

### After Phase 1 (Safe upgrades)
- [ ] `npm run lint` passes
- [ ] `npm run test:jest` passes
- [ ] `npm run build` succeeds

### After Phase 2 (Jest upgrades)
Critical verification:
1. **Matcher Aliases**
   ```bash
   grep -r "toBeCalled\|toReturn\|toBeCalledWith" src/
   ```
   Expected: No results, or confirm intentional usage

2. **Mock Module Paths**
   ```bash
   grep -r "jest.mock\|jest.genMockFromModule" src/
   ```
   Expected: Verify paths use exact case matching

3. **Test Runs**
   - [ ] `npm run test:jest` - all tests pass
   - [ ] `npm run test:ct` - component tests pass
   - [ ] `npm run test:watch` - watch mode works

### After Phase 3 (Size-limit upgrades)
- [ ] `npm run size` - checks pass (no unexpected size growth)
- [ ] `npm run analyze` - review any size changes
- [ ] `npm run build` - no build errors

### After Phase 4 (rimraf upgrades)
- [ ] `npm run build` - uses shell rm-rf, not affected
- [ ] Verify CI/deployment uses Node >= 20

---

## Risk Assessment

### High Priority (Critical Path)
1. **Jest 30 upgrade** - Multiple breaking changes, widely used
   - Estimated time: 1-2 hours (verification + potential fixes)
   - Risk level: High (affects all Jest tests)
   - Mitigation: Full test suite run before committing

### Medium Priority
2. **jest-environment-jsdom 30** - DOM behavior changes possible
   - Estimated time: 30 minutes (test verification)
   - Risk level: Medium (affects React component tests)
   - Mitigation: Run full test suite, especially React component tests

3. **rimraf 6** - Node.js version requirement
   - Estimated time: 5 minutes (version audit)
   - Risk level: Medium (breaks on Node 18-19)
   - Mitigation: Verify deployment Node.js versions first

### Low Priority (Safe)
4. **@jest/globals 30** - Type-only changes, likely not affected
5. **size-limit 12** - No code changes needed
6. **All type packages** - Pure type updates
7. **@vitejs/plugin-react 5** - No breaking changes
8. **@types/* packages** - Safe type updates

---

## References

- [Jest 30 Migration Guide](https://jestjs.io/docs/upgrading-to-jest30)
- [Jest 30 Release Blog](https://jestjs.io/blog/2025/06/04/jest-30)
- [rimraf GitHub Repository](https://github.com/isaacs/rimraf)
- [size-limit GitHub Repository](https://github.com/ai/size-limit)
- [@vitejs/plugin-react CHANGELOG](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/CHANGELOG.md)
- [Node.js 25 Release Notes](https://nodejs.org/en/blog/release/v25.0.0)

---

## Conclusion

**Recommended Strategy**:
1. Start with the 3 safe minor upgrades (no risk)
2. Plan Jest 30 upgrade carefully with full test verification
3. Defer rimraf 6 until Node.js version policy is clarified
4. Upgrade size-limit 12 together with Jest testing phase

**Estimated Total Time**: 2-3 hours for full verification and testing across all upgrades.

**Risk Level**: Medium overall (Jest 30 is the main concern; rest are manageable)
