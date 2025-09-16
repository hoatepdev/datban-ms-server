import { readdirSync } from 'fs';

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const scopes = [];
for (const path of getDirectories('./src').map((p) => `./src/${p}`)) {
  const files = readdirSync(path, { withFileTypes: true });
  scopes.push(...files.filter((item) => item.isDirectory()).map((item) => item.name));
}

scopes.push(
  'remove',
  'revert',
  'conflict',
  'config',
  'entity',
  'utils',
  'deps',
  'modules',
  'test',
  'migration',
  'core',
  'swagger'
);

// feat! (MAJOR, 1.0.0 → 2.0.0): feat!: 💥 - Signals breaking changes from a major feature introduction.
// feat (MINOR, 1.0.0 → 1.1.0): ✨ - Represents introducing new features without breaks.
// fix (PATCH, 1.0.0 → 1.0.1): 🐛 - Directly matches fixing a bug or issue.
// build (PATCH): build: 🏗️ - For adding or updating configuration files, fitting build tweaks.
// ci (PATCH): ci: 👷 - Specifically for adding or updating CI build systems.
// chore (PATCH): chore: 🔧 - Covers maintenance tasks like config or dependency updates.
// docs (PATCH): docs: 📝 - Explicitly for adding or updating documentation.
// perf (PATCH): perf: ⚡️ - For performance improvements.
// refactor (PATCH): refactor: ♻️ - For refactoring code.
// revert (PATCH): revert: ⏪️ - For reverting changes.
// style (PATCH): style: 💄 - For UI/style file updates, extending to code formatting.
// test (PATCH): test: 🧪 - For adding, updating, or passing tests.Ctrl + Shift + P

export default {
  extends: ['@commitlint/config-conventional'],
  ignores: [(message) => message.includes('release')],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', scopes]
  }
};
