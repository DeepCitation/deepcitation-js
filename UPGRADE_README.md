# Package Upgrade Research - Complete Guide

This directory contains comprehensive research and action plans for upgrading your npm dependencies. Start here, then choose your path based on your needs.

## 📋 Document Index

### 1. **START HERE: UPGRADE_QUICK_REFERENCE.md** (5 min read)
   - **Best for**: Quick decision-making
   - **Contains**: Status table, can I upgrade?, what will break
   - **Format**: TL;DR with emoji indicators
   - **Perfect if**: You just want the essentials

### 2. **UPGRADE_RESEARCH.md** (15 min read)
   - **Best for**: Understanding the full picture
   - **Contains**: Detailed analysis of each package, breaking changes, impact
   - **Format**: Structured analysis with pros/cons
   - **Perfect if**: You want to understand everything before upgrading

### 3. **UPGRADE_CODE_PATTERNS.md** (10 min read)
   - **Best for**: Knowing what to look for in your code
   - **Contains**: Deprecated patterns, grep commands, replacement examples
   - **Format**: Copy-paste code patterns and search commands
   - **Perfect if**: You're about to do the upgrade and need specific guidance

### 4. **UPGRADE_COMMANDS.md** (5 min read)
   - **Best for**: Step-by-step execution
   - **Contains**: Exact npm commands to run, phase-by-phase approach
   - **Format**: Terminal-ready commands you can copy/paste
   - **Perfect if**: You're ready to upgrade and need clear instructions

---

## 🎯 Recommended Reading Path

### Path A: Just Tell Me What to Do (15 minutes total)
1. Read: **UPGRADE_QUICK_REFERENCE.md**
2. Run: **UPGRADE_COMMANDS.md** (Phase 1 & 2)
3. Done!

### Path B: I Want to Understand Everything (30 minutes total)
1. Read: **UPGRADE_QUICK_REFERENCE.md** (get overview)
2. Read: **UPGRADE_RESEARCH.md** (understand details)
3. Reference: **UPGRADE_CODE_PATTERNS.md** (during upgrade)
4. Run: **UPGRADE_COMMANDS.md** (when ready)

### Path C: I'm the Careful Type (1 hour total)
1. Read: **UPGRADE_RESEARCH.md** (full details)
2. Read: **UPGRADE_CODE_PATTERNS.md** (detailed patterns)
3. Search your codebase using commands from patterns doc
4. Plan your approach
5. Run: **UPGRADE_COMMANDS.md** with full awareness

---

## 📊 Executive Summary

| Package | Version | Risk | Code Changes | Status |
|---------|---------|------|--------------|--------|
| @types/jest | 29→30 | ✅ None | No | ✅ Safe |
| @types/node | 24→25 | ✅ None | No | ✅ Safe |
| @vitejs/plugin-react | 4→5 | ✅ None | No | ✅ Safe |
| jest | 29→30 | ⚠️ High | Possible | ⚠️ Test required |
| jest-environment-jsdom | 29→30 | ⚠️ Medium | Unlikely | ⚠️ Test required |
| @jest/globals | 29→30 | ⚠️ Low | Unlikely | ⚠️ Verify |
| size-limit | 11→12 | ⚠️ Low | No | ⚠️ Test required |
| @size-limit/preset-small-lib | 11→12 | ⚠️ Low | No | ⚠️ Test required |
| rimraf | 5→6 | ❌ High | No | ❌ Skip (Node.js 20 required) |

---

## 🚀 Quick Start

```bash
# Phase 1: Safe upgrades (no risk)
npm install --save-dev \
  "@types/jest@30.0.0" \
  "@types/node@25.2.3" \
  "@vitejs/plugin-react@5.1.4"

# Verify
npm run build && npm run lint

# Phase 2: Jest upgrade (test required)
npm install --save-dev \
  "jest@30.2.0" \
  "@jest/globals@30.2.0" \
  "jest-environment-jsdom@30.2.0"

# Verify thoroughly
npm run build && npm run test:jest && npm run test:ct && npm run lint

# Phase 3: Size-limit (test required)
npm install --save-dev \
  "size-limit@12.0.0" \
  "@size-limit/preset-small-lib@12.0.0"

# Verify
npm run build && npm run size
```

For detailed commands with explanations, see **UPGRADE_COMMANDS.md**.

---

## ⚠️ Key Findings

### Safe to Upgrade Now (3 packages)
- **@types/jest**, **@types/node**, **@vitejs/plugin-react**
- Pure type definitions or stable minor versions
- No breaking changes
- No code modifications needed

### Requires Testing (5 packages)
- **jest**, **jest-environment-jsdom**, **@jest/globals**, **size-limit**, **@size-limit/preset-small-lib**
- Breaking changes exist but may not affect your code
- Full test suite must pass after upgrade
- Estimated time: 1-2 hours for verification

### Should Skip (1 package)
- **rimraf** (v5→v6)
- Requires Node.js >= 20
- Your project allows Node.js >= 18
- Skip unless you update Node.js policy

---

## 🔍 What Could Break?

### Jest 30 Breaking Changes
1. **Deprecated matcher names**
   - `toBeCalled()` → `toHaveBeenCalled()`
   - `toBeCalledWith()` → `toHaveBeenCalledWith()`
   - And 8 more similar renames
   - **Your code**: No deprecated matchers detected ✅

2. **Case-sensitive jest.mock() paths**
   - Old: `jest.mock('./MyModule')` works even if file is `myModule.ts`
   - New: Must match exact case
   - **Your code**: Using vitest, not directly affected ✅

3. **jest.genMockFromModule removal**
   - Old API completely removed
   - Replaced with `jest.createMockFromModule()`
   - **Your code**: Not using this API ✅

### jsdom 26 Changes (Jest environment)
- Upgrades from jsdom 21 to 26 (5 years of changes)
- DOM behavior may differ subtly
- More standards-compliant
- **Your code**: Using happy-dom primarily ✅

---

## ✅ Pre-Upgrade Checklist

Before running any upgrades:

```bash
# Verify current state
git status                  # Clean working directory
npm run build              # Build works
npm run test:jest          # Tests pass
npm run test:ct            # Component tests pass
npm run lint               # Code quality OK
npm run size               # Bundle sizes OK

# Create baseline commit
git commit -m "chore: pre-upgrade snapshot"
```

---

## 📈 Success Criteria

After upgrades complete:

```bash
# All these must pass
npm run build                # No build errors
npm run test:jest            # All tests pass
npm run test:ct              # All component tests pass
npm run lint                 # Code quality OK
npm run size                 # Bundle limits respected
npm audit                    # No critical vulnerabilities
```

---

## 🔄 Rollback Plan

If something breaks:

```bash
# Quick rollback
git reset --hard HEAD~1
rm -rf node_modules
npm install

# Verify
npm run build && npm run test:jest
```

---

## 📚 Additional Resources

- [Jest 30 Official Migration Guide](https://jestjs.io/docs/upgrading-to-jest30)
- [Jest 30 Blog Post](https://jestjs.io/blog/2025/06/04/jest-30)
- [rimraf GitHub Repository](https://github.com/isaacs/rimraf)
- [size-limit GitHub Repository](https://github.com/ai/size-limit)
- [Node.js 25 Release Notes](https://nodejs.org/en/blog/release/v25.0.0)

---

## 💡 Pro Tips

1. **Upgrade incrementally**: Do safe upgrades first (Phase 1), test thoroughly before Phase 2
2. **Run full test suite**: Always run `npm run test:jest && npm run test:ct` after upgrades
3. **Monitor bundle size**: Use `npm run analyze` if size-limit reports unexpected growth
4. **Use git strategically**: Commit after each successful phase for easy rollback
5. **Test on CI**: Consider testing on multiple Node.js versions if relevant

---

## 🎓 Learning Resources

This research is based on official documentation from:
- Jest official migration guides
- Package changelogs
- Community upgrade experiences
- Official npm documentation

All changes are documented with source links in the detailed research documents.

---

## 📞 Need Help?

### For Deprecated Matcher Issues
See: **UPGRADE_CODE_PATTERNS.md** → Section "Deprecated Matcher Names"

### For Build/Size Issues
See: **UPGRADE_CODE_PATTERNS.md** → Section "size-limit 12 - Configuration Changes"

### For Node.js Compatibility
See: **UPGRADE_QUICK_REFERENCE.md** → "rimraf 5→6 requires Node.js >= 20"

### For Step-by-Step Instructions
See: **UPGRADE_COMMANDS.md** → Copy the exact command for your phase

---

## 🎬 Get Started Now

Choose your path:

- **Quick Version** (5 min): Read UPGRADE_QUICK_REFERENCE.md
- **Full Version** (20 min): Read UPGRADE_RESEARCH.md
- **Detailed Code** (30 min): Read UPGRADE_CODE_PATTERNS.md
- **Execute** (60 min): Follow UPGRADE_COMMANDS.md

---

**Date Created**: February 15, 2026
**Project**: @deepcitation/deepcitation-js
**Current Node**: >=18
**Current TypeScript**: ^5.9.3

---

## Document Sizes

- UPGRADE_QUICK_REFERENCE.md (4.1 KB) - Fast overview
- UPGRADE_RESEARCH.md (14 KB) - Complete analysis
- UPGRADE_CODE_PATTERNS.md (9.5 KB) - Code-specific patterns
- UPGRADE_COMMANDS.md (9.2 KB) - Executable commands

**Total**: ~37 KB of comprehensive upgrade documentation
