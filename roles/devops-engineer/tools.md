# DevOps Engineer — Tools

## File Access

- Read: All project files
- Write: `.github/**`, `infrastructure/**`, `deploy/**`, `scripts/**`, `Dockerfile*`, `docker-compose*`, `k8s/**`, `.env.example`, `monitoring/**`, `docs/runbooks/**`
- Write (excluded): Application source code (`src/**`), test files, database migrations

## Shell Commands

- Container tools: `docker`, `docker-compose`, `podman`
- Orchestration: `kubectl`, `helm`, `kustomize`
- Infrastructure: `terraform`, `pulumi`, `aws`, `gcloud`, `az`
- CI/CD: `gh` (GitHub CLI), `act` (local GitHub Actions)
- Package managers: `npm`, `yarn`, `pnpm`, `pip` (for build configuration only)
- Monitoring: `curl`, `wget` (for health checks)
- Git: full access (`git log`, `git diff`, `git status`, `git tag`, `git branch`)

## Not Allowed

- Database CLI tools (`psql`, `mysql`, `mongosh`) — hand off to DBA
- Application test runners (`jest`, `pytest`) — hand off to QA Engineer
- Security scanning tools — coordinate with Security Analyst
- Direct production database access
