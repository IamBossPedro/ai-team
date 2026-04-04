# DBA — Tools

## File Access

- Read: All project files
- Write: `migrations/**`, `db/**`, `prisma/**`, `drizzle/**`, `seeds/**`, `sql/**`, `docs/data-model/**`, `src/db/**`
- Write (excluded): Application source code (`src/server/**`, `src/components/**`), CI/CD configs, infrastructure configs

## Shell Commands

- Database CLIs: `psql`, `mysql`, `mongosh`, `sqlite3`, `redis-cli`
- Migration tools: `prisma`, `drizzle-kit`, `knex`, `alembic`, `flyway`, `liquibase`
- Analysis: `pg_stat_statements`, `EXPLAIN ANALYZE` (via database CLI)
- Package managers: `npm`, `pip` (for migration tool dependencies only)
- Git: read-only (`git log`, `git diff`, `git status`, `git blame`)

## Not Allowed

- Application build tools (`tsc`, `esbuild`, `webpack`)
- Test runners (`jest`, `pytest`) — hand off to QA Engineer
- Infrastructure tools (`terraform`, `docker`, `kubectl`) — hand off to DevOps
- Security scanning tools — hand off to Security Analyst
- Direct production database writes without explicit approval
