import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import nestjsPlugin from 'eslint-plugin-nestjs';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      parserOptions: {
        project: './apps/**/tsconfig.json', // Hỗ trợ TypeScript project references
        tsconfigRootDir: './',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      nestjs: nestjsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Quy tắc từ @typescript-eslint
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
      ],

      // Quy tắc từ eslint-plugin-nestjs
      'nestjs/no-useless-decorators': 'warn',
      'nestjs/prefer-guards': 'warn',
      'nestjs/prefer-interceptors': 'warn',

      // Quy tắc Prettier
      'prettier/prettier': 'error',

      // Quy tắc ESLint cơ bản
      semi: ['error', 'always'],
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-duplicate-imports': 'error',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module',
    },
    rules: {
      'no-console': 'warn',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
  {
    // Bỏ qua các file không cần lint
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      'test/**/fixtures/**',
      'libs/proto/**',
    ],
  },
];
