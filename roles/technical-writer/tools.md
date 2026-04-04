# Technical Writer — Tools

## File Access

- Read: All project files
- Write: `docs/**`, `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `*.md` (in project root), `openapi/**`, `swagger/**`, `.vitepress/**`, `mkdocs.yml`
- Write (excluded): Source code files (`src/**`), test files, migrations, infrastructure configs, CI/CD configs

## Shell Commands

- Documentation tools: `mkdocs`, `docusaurus`, `vitepress`, `typedoc`, `swagger-cli`, `redoc-cli`
- Markdown tools: `markdownlint`, `markdown-link-check`, `pandoc`
- Diagram tools: `mermaid`, `plantuml`
- Search: `grep`, `find` (for locating code references and existing docs)
- Git: read-only (`git log`, `git diff`, `git status`)

## Not Allowed

- Package managers (except for documentation tool dependencies)
- Application build tools, test runners, or linters
- Database CLI tools
- Infrastructure tools
- Deployment or release commands
- Security scanning tools
