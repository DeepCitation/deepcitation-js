# Upgrade Execution Commands

Copy and run these commands in sequence to safely upgrade your dependencies.

## Phase 0: Pre-Upgrade Baseline

```bash
# Create a clean git commit point
git status
git add -A
git commit -m "chore: pre-upgrade snapshot"

# Verify everything works now
npm run build
npm run test:jest
npm run test:ct
npm run lint
npm run size

# Note current versions
npm list jest @types/jest @types/node rimraf size-limit
```

---

## Phase 1: Safe Upgrades (No Breaking Changes)

These are pure type packages or stable minor versions. Run all together:

```bash
npm install --save-dev \
  "@types/jest@30.0.0" \
  "@types/node@25.2.3" \
  "@vitejs/plugin-react@5.1.4"
```

### Verify Phase 1:
```bash
# Should complete without errors
npm run build
npm run lint

# Commit
git commit -m "chore: upgrade types and vite plugin to latest minor versions"
```

---

## Phase 2: Critical Jest 30 Upgrade

Before running this, **read UPGRADE_CODE_PATTERNS.md** for what could break.

### Step 1: Upgrade Jest packages together
```bash
npm install --save-dev \
  "jest@30.2.0" \
  "@jest/globals@30.2.0" \
  "jest-environment-jsdom@30.2.0"
```

### Step 2: Run full test verification
```bash
# Run ALL tests - this is critical
npm run build
npm run test:jest
npm run test:ct
npm run lint

# If any tests fail, DON'T COMMIT yet
# See UPGRADE_CODE_PATTERNS.md for fixes
```

### Step 3: Check for deprecated matcher usage
```bash
# Search for old matcher names (should find nothing)
grep -r "\.toBeCalled\|\.toBeCalledWith\|\.toReturn\|\.toReturnWith" src/ \
  --include="*.test.ts" --include="*.test.tsx"

# If found any, see UPGRADE_CODE_PATTERNS.md section 1 for replacement guide
```

### Step 4: Verify jest.mock() paths
```bash
# Check that all jest.mock paths match actual file names (case-sensitive)
grep -r "jest\.mock" src/ --include="*.test.ts" --include="*.test.tsx"

# Manually verify each path matches the actual filename case
# Most projects won't have issues here
```

### Step 5: Commit if all tests pass
```bash
git commit -m "chore: upgrade jest and jsdom to v30

- Upgrade jest from 29.7.0 to 30.2.0
- Upgrade jest-environment-jsdom from 29.7.0 to 30.2.0
- Upgrade @jest/globals from 29.7.0 to 30.2.0
- Verify all tests pass with new matcher API"
```

---

## Phase 3: Tool Upgrades (size-limit and related)

These should work without code changes, but verify bundle sizes:

### Step 1: Upgrade together
```bash
npm install --save-dev \
  "size-limit@12.0.0" \
  "@size-limit/preset-small-lib@12.0.0"
```

### Step 2: Test size limits
```bash
# Verify bundle sizes haven't changed unexpectedly
npm run size

# If any limits exceeded, see output for which files grew
# Run analyze for details
npm run analyze

# If sizes are acceptable, proceed
# If not, investigate what changed
```

### Step 3: Full build verification
```bash
npm run build
npm run test:jest
npm run test:ct
npm run lint
```

### Step 4: Commit
```bash
git commit -m "chore: upgrade size-limit to v12

- Upgrade size-limit from 11.2.0 to 12.0.0
- Upgrade @size-limit/preset-small-lib from 11.2.0 to 12.0.0
- Verify bundle sizes remain within limits"
```

---

## Phase 4: rimraf Upgrade (CONDITIONAL)

**READ THIS BEFORE RUNNING**:

rimraf 6 requires Node.js >= 20. Your project currently allows Node >= 18.

### Decision: Should you upgrade?

```bash
# Check your Node policy
cat package.json | grep -A2 '"engines"'

# Check what Node versions are used in CI
cat .github/workflows/*.yml | grep node-version

# Check deployment requirements
# (ask your team or check deployment docs)
```

**If Node.js >= 20 is guaranteed everywhere:**
```bash
npm install --save-dev "rimraf@6.1.2"
npm run build
npm run test:jest
git commit -m "chore: upgrade rimraf to v6 (requires Node.js >= 20)"
```

**If Node.js 18 or 19 is still used:**
```bash
# Skip this upgrade
echo "⚠️ rimraf 6 requires Node.js >= 20"
echo "Not upgrading until Node.js policy is updated"
```

---

## Phase 5: Verification and Cleanup

After all upgrades:

```bash
# Full verification
npm run build
npm run test:jest
npm run test:ct
npm run lint
npm run size
npm run analyze

# Check dependencies for any issues
npm audit

# Update lock file
npm install

# Final commit
git commit -m "chore: verify all upgrades and dependencies"

# View summary
git log --oneline -5
npm list jest @types/jest @types/node @vitejs/plugin-react size-limit rimraf
```

---

## Rollback Commands (If Something Breaks)

### Quick Rollback
```bash
# Revert all package changes
git reset --hard HEAD~1    # Go back one commit
rm -rf node_modules
npm install

# Verify
npm run build
npm run test:jest
```

### Selective Rollback
```bash
# If only one package is problematic, downgrade it
npm install --save-dev "jest@29.7.0"
npm install

# Then re-run tests
npm run test:jest
```

---

## Troubleshooting Commands

### If tests fail after Jest upgrade:

```bash
# Check for deprecated matchers
grep -r "\.toBeCalled\|\.toReturn\|\.toBeCalledWith" src/ --include="*.test.ts" --include="*.test.tsx"

# Check Jest mock configuration
grep -r "jest\.mock" src/ --include="*.test.ts" --include="*.test.tsx"

# Run tests with verbose output
npm run test:jest -- --verbose

# Run specific test file
npm run test:jest -- src/__tests__/YourTest.test.ts
```

### If bundle size increases:

```bash
# Analyze what changed
npm run analyze

# Compare bundle with specific package
npm run analyze -- --why
```

### If TypeScript errors appear:

```bash
# Check for type issues
npm run build:tsc

# Look for SpyInstance usage (removed in Jest 30)
grep -r "SpyInstance\|MockFunctionMetadata" src/ --include="*.ts" --include="*.tsx"
```

---

## Recommended Upgrade Timeline

### Approach 1: Conservative (Lowest Risk)
```bash
# Day 1: Safe upgrades only
# Phases 1 (Types and plugins)
# Commit and deploy

# Day 2-3: Jest upgrade with thorough testing
# Phase 2 (Jest 30)
# Full regression testing
# Commit and deploy

# Week 2: Tools
# Phase 3 (size-limit)
# Phase 4 (rimraf if applicable)
```

### Approach 2: Aggressive (Fastest)
```bash
# All at once
# Phases 1, 2, 3, (skip 4)
# Run full test suite
# If passes, commit all at once
```

---

## Monitoring Commands

After each phase, run these to monitor impact:

```bash
# Check package count
npm ls --depth=0 | wc -l

# Check install size
du -sh node_modules

# Check for vulnerabilities
npm audit

# Check for updates available
npm outdated

# Quick health check
npm run build && npm run test:jest && npm run size
```

---

## CI/CD Integration

### GitHub Actions
If you have CI, add these steps before merging:

```yaml
name: Test Upgrades
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]  # Test multiple Node versions
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run build
      - run: npm run test:jest
      - run: npm run test:ct
      - run: npm run lint
      - run: npm run size
```

---

## Pre-Commit Hook (Optional)

Add to `.husky/pre-commit` to prevent broken commits:

```bash
#!/bin/bash
npm run build || exit 1
npm run test:jest || exit 1
npm run lint || exit 1
```

---

## Success Criteria Checklist

After completing all upgrades:

- [ ] All phases installed without errors
- [ ] `npm run build` succeeds
- [ ] `npm run test:jest` passes all tests
- [ ] `npm run test:ct` passes all component tests
- [ ] `npm run lint` passes
- [ ] `npm run size` shows no unexpected growth
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] All commits are clean and logical
- [ ] Code review passes
- [ ] Ready to merge and deploy

---

## Quick Copy-Paste: All-In-One Script

**Warning**: Only use this if you've read all documentation and understand the risks.

```bash
#!/bin/bash
set -e

echo "Phase 1: Safe upgrades..."
npm install --save-dev \
  "@types/jest@30.0.0" \
  "@types/node@25.2.3" \
  "@vitejs/plugin-react@5.1.4"

npm run build
npm run lint
git commit -m "chore: upgrade types and vite plugin"

echo "Phase 2: Jest 30..."
npm install --save-dev \
  "jest@30.2.0" \
  "@jest/globals@30.2.0" \
  "jest-environment-jsdom@30.2.0"

npm run build
npm run test:jest
npm run test:ct
npm run lint
git commit -m "chore: upgrade jest to v30"

echo "Phase 3: Size-limit..."
npm install --save-dev \
  "size-limit@12.0.0" \
  "@size-limit/preset-small-lib@12.0.0"

npm run build
npm run test:jest
npm run test:ct
npm run size
git commit -m "chore: upgrade size-limit to v12"

echo "✅ All upgrades complete!"
npm list jest @types/jest @types/node rimraf size-limit
```

Save as `upgrade.sh`, then:
```bash
chmod +x upgrade.sh
./upgrade.sh
```

---

## Next Steps

1. **Choose your approach** (conservative vs aggressive)
2. **Read** UPGRADE_RESEARCH.md for full details
3. **Run** Phase 1 commands
4. **Verify** with the success criteria
5. **Proceed** to Phase 2 if confident
6. **Commit** after each phase
7. **Deploy** when ready

---

## Support Resources

- [Jest 30 Migration Guide](https://jestjs.io/docs/upgrading-to-jest30)
- [UPGRADE_RESEARCH.md](./UPGRADE_RESEARCH.md) - Full analysis
- [UPGRADE_CODE_PATTERNS.md](./UPGRADE_CODE_PATTERNS.md) - What to search for
- [UPGRADE_QUICK_REFERENCE.md](./UPGRADE_QUICK_REFERENCE.md) - TL;DR version
