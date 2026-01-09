import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import path from 'path';
import { fileURLToPath } from 'url';

const isProduction = process.env.NODE_ENV === 'production';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['**/__tests__/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        Blob: 'readonly',
        browser: 'readonly',
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        crypto: 'readonly',
        btoa: 'readonly',
        Image: 'readonly',
        NodeJS: 'readonly',
        React: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        process: "readonly",
        performance: "readonly",
        Buffer: "readonly",
        requestIdleCallback: "readonly",
        cancelIdleCallback: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        HTMLSpanElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLTextAreaElement: "readonly",
        HTMLSelectElement: "readonly",
        HTMLOptionElement: "readonly",
        HTMLFormElement: "readonly",
        HTMLTableElement: "readonly",
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': typescript,
    },
    rules: {
      // React rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],
      
      // TypeScript rules
      
      'no-use-before-define': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_" }],
      '@typescript-eslint/no-explicit-any': 'off',
      
      // General rules
      'no-console': isProduction ?["error", { allow: ["warn", "error"] }] :  'off',
      'no-debugger': isProduction ? 'warn' : 'off',
      'prefer-const': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    // Apply different rules to JS/CJS configuration files
    files: ['*.js', '*.cjs'],
    // Turn off type-aware linting for these files
    extends: ['plugin:@typescript-eslint/disable-type-checked'],
  },
  prettier,
];
