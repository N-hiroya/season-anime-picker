import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    '.next/**',
    'coverage/**',
    'next-env.d.ts',
    'playwright-report/**',
    'test-results/**',
  ]),

  // ESLint公式の推奨ルール
  js.configs.recommended,

  // JavaScript全体に適用する設定
  {
    files: ['**/*.{js,mjs,cjs}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      // 未使用変数
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // consoleの残存を警告
      'no-console': 'warn',

      // == / != を禁止
      eqeqeq: ['error', 'always'],

      // 再代入しない変数はconstにする
      'prefer-const': 'error',

      // ifなどの{}を必須にする
      curly: ['error', 'all'],
    },
  },

  // Browser用
  {
    files: ['src/**/*.{js,mjs,cjs}'],

    languageOptions: {
      globals: globals.browser,
    },
  },

  // Node.js用
  {
    files: ['*.config.{js,mjs,cjs}', 'scripts/**/*.{js,mjs,cjs}'],

    languageOptions: {
      globals: globals.node,
    },
  },

  // 競合が発生した場合、Prettierを優先
  // 必ず最後に配置
  eslintConfigPrettier,
]);
