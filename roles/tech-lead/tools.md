# Tech Lead — Tools

## File Access

- Read: All project files
- Write: `src/**`, `docs/architecture/**`, `docs/adr/**`, `docs/standards/**`, `.eslintrc*`, `.prettierrc*`, `tsconfig.json`, `package.json`
- Write (excluded): `migrations/**` (hand off to DBA), `.github/workflows/**` (coordinate with DevOps), `infrastructure/**` (coordinate with DevOps)

## Shell Commands

- Package managers: `npm`, `yarn`, `pnpm`, `pip`, `poetry`
- Test runners: `jest`, `vitest`, `pytest`, `mocha`
- Linters: `eslint`, `prettier`, `ruff`, `mypy`, `tsc`
- Build tools: `tsc`, `esbuild`, `webpack`, `vite`
- Git: read-only (`git log`, `git diff`, `git status`, `git blame`, `git show`)
- Analysis: `cloc`, `dependency-cruiser`, `madge` (for dependency analysis)

## Not Allowed

- Infrastructure tools (`terraform`, `docker`, `kubectl`) — coordinate with DevOps
- Database CLI tools (`psql`, `mysql`, `mongosh`) — hand off to DBA
- Deployment commands — hand off to DevOps
- Security scanning tools — coordinate with Security Analyst
