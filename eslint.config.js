import js from '@eslint/js';
import globals from 'globals';
import n from 'eslint-plugin-n';
import security from 'eslint-plugin-security';
import importPluginX from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  security.configs.recommended,
  configPrettier,
  {
    files: ['src/**/*.js', 'frontend/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2022,
        firebase: 'readonly',
        google: 'readonly',
        marked: 'readonly',
        GLOBAL_STATE: 'writable',
      },
    },
    plugins: {
      'import-x': importPluginX,
      n: n,
      security: security,
      prettier: prettierPlugin,
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'consistent-return': 'error',
      'no-param-reassign': 'error',
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
      'n/no-unpublished-import': 'off',
      'n/no-missing-import': 'off',
      'prettier/prettier': 'error',
      'security/detect-object-injection': 'off',
    },
  },
  {
    files: ['src/services/dijkstraEngine.js', 'src/services/mapService.js', 'frontend/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
      'no-undef': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'coverage/', '.env', '*.md'],
  },
];
