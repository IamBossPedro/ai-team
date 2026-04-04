# Backend Developer — Tools

## File Access

- Read: All project files
- Write: `src/server/**`, `src/api/**`, `src/services/**`, `src/lib/**`, `src/utils/**`, `tests/**`
- Write (excluded): `src/components/**`, `src/pages/**`, `src/app/**` (frontend), `migrations/**`, `.github/**`, `infrastructure/**`

## Shell Commands

- Package managers: `npm`, `yarn`, `pnpm`, `pip`, `poetry`
- Test runners: `jest`, `vitest`, `pytest`, `mocha`
- Linters: `eslint`, `prettier`, `ruff`, `mypy`
- Build tools: `tsc`, `esbuild`, `webpack`
- HTTP clients: `curl`, `httpie` (for API testing)
- Git: read-only (`git log`, `git diff`, `git status`, `git blame`)

## Not Allowed

- Database CLI tools (`psql`, `mysql`, `mongosh`) — hand off to DBA
- Infrastructure tools (`terraform`, `docker`, `kubectl`) — hand off to DevOps
- Security scanning tools — hand off to Security Analyst
