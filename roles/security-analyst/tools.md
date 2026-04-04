# Security Analyst — Tools

## File Access

- Read: All project files
- Write: `docs/security/**`, `security/**`, `src/middleware/auth*`, `src/middleware/security*`, `src/config/security*`, `tests/security/**`, `.env.example` (to document required security variables)
- Write (excluded): Application business logic, database migrations, CI/CD configs, infrastructure configs

## Shell Commands

- Security scanners: `npm audit`, `snyk`, `trivy`, `semgrep`, `bandit`, `safety`
- Dependency analysis: `npm ls`, `pip show`, `license-checker`
- HTTP tools: `curl`, `httpie`, `openssl` (for TLS verification)
- Secret scanning: `gitleaks`, `trufflehog`, `detect-secrets`
- Static analysis: `eslint-plugin-security`, `sonarqube`
- Git: read-only (`git log`, `git diff`, `git status`, `git blame`)

## Not Allowed

- Database CLI tools for data access (`psql`, `mysql`) — coordinate with DBA
- Infrastructure provisioning tools (`terraform`, `kubectl`) — coordinate with DevOps
- Build and deployment commands
- Application test runners (except security-specific tests)
