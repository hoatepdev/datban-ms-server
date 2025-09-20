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
        project: './apps/**/tsconfig.json',
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
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          filter: {
            regex: '^(__|[a-z]+_[a-z]+)$', // Cho phép snake_case
            match: false,
          },
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',

      // Quy tắc từ eslint-plugin-nestjs
      'nestjs/no-useless-decorators': 'off', // Tắt nếu không cần thiết
      'nestjs/prefer-guards': 'off',
      'nestjs/prefer-interceptors': 'off',

      // Quy tắc Prettier
      'prettier/prettier': 'error',

      // Quy tắc ESLint cơ bản
      semi: ['error', 'always'],
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
      'no-duplicate-imports': 'error',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module',
    },
    rules: {
      'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
  {
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
