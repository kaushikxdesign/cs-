import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public/legacy', 'src/legacy'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/features/*', '@/design-system/*', '@/layout/*', '@/state/*'],
          message: 'src/data must not import outside src/data — it would create a load-order cycle.',
        }],
      }],
    },
  },
  {
    // The data layer is the bottom of the graph: it may import only from itself.
    files: ['src/data/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: ['@/*', '../*'] }] },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/data/**/*.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
);
