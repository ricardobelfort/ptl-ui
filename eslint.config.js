import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';

export default [
  {
    ignores: ['projects/**/*', 'dist/**/*', 'node_modules/**/*'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angular,
    },
    rules: {
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      '@typescript-eslint/no-unused-vars': 'error',
      'no-undef': 'off', // TypeScript handles this
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {},
  },
];