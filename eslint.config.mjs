import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import piano from './eslint-rules/index.mjs';

export default tseslint.config(
  { ignores: ['out', 'dist', 'release', 'coverage', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts,mjs}'],
    languageOptions: { globals: { ...globals.node } },
    plugins: { piano },
    rules: {
      'piano/no-color-literals': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    ...reactHooks.configs.flat['recommended-latest'],
  },
  {
    files: ['src/renderer/**/*.tsx'],
    ignores: ['src/renderer/ui/**'],
    rules: { 'piano/no-raw-elements': 'error' },
  },
  {
    files: ['src/renderer/themes/**', 'eslint-rules/**'],
    rules: { 'piano/no-color-literals': 'off' },
  },
);
