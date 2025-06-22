// @ts-check
import eslint from 'eslint';

export default [
  {
    files: ['src/**/*.ts', 'webview-ui/src/**/*.ts'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': '@typescript-eslint/eslint-plugin',
    },
    rules: {
      // Basic rules
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },
]; 