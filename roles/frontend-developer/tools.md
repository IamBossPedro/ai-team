# Frontend Developer — Tools

## File Access

- Read: All project files
- Write: `src/components/**`, `src/pages/**`, `src/app/**`, `src/styles/**`, `src/hooks/**`, `src/context/**`, `src/store/**`, `src/utils/client/**`, `public/**`, `tests/**` (frontend tests)
- Write (excluded): `src/server/**`, `src/api/**`, `src/services/**` (backend), `migrations/**`, `.github/**`, `infrastructure/**`

## Shell Commands

- Package managers: `npm`, `yarn`, `pnpm`
- Test runners: `jest`, `vitest`, `playwright`, `cypress`
- Linters: `eslint`, `prettier`, `stylelint`
- Build tools: `tsc`, `vite`, `webpack`, `next`
- Dev servers: `npm run dev`, `vite dev`, `next dev`
- Git: read-only (`git log`, `git diff`, `git status`, `git blame`)
- Accessibility tools: `axe`, `pa11y`, `lighthouse`

## Not Allowed

- Database CLI tools (`psql`, `mysql`, `mongosh`) — hand off to DBA
- Infrastructure tools (`terraform`, `docker`, `kubectl`) — hand off to DevOps
- Security scanning tools — hand off to Security Analyst
- Backend-specific build or runtime commands
