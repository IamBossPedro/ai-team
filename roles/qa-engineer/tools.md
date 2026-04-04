# QA Engineer — Tools

## File Access

- Read: All project files
- Write: `tests/**`, `__tests__/**`, `*.test.*`, `*.spec.*`, `test-utils/**`, `fixtures/**`
- Write (excluded): Production source files, migrations, infrastructure configs

## Shell Commands

- Test runners: `jest`, `vitest`, `pytest`, `mocha`, `playwright`, `cypress`
- Coverage tools: `c8`, `istanbul`, `coverage`
- Linters: `eslint`, `prettier` (for test files only)
- Git: read-only (`git log`, `git diff`, `git status`)
- HTTP clients: `curl`, `httpie` (for API testing)

## Not Allowed

- Database CLI tools
- Infrastructure tools
- Build and deployment tools
- Package publishing commands
