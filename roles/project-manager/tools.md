# Project Manager — Tools

## File Access

- Read: All project files
- Write: `docs/project/**`, `docs/plans/**`, `docs/status/**`, `docs/meeting-notes/**`, `CHANGELOG.md`, `TODO.md`
- Write (excluded): Source code files, test files, migrations, infrastructure configs, CI/CD configs

## Shell Commands

- Git: read-only (`git log`, `git diff`, `git status`, `git shortlog`)
- Search: `grep`, `find` (for locating documentation and tracking files)
- Markdown tools: `mdx`, `pandoc` (for document formatting)

## Not Allowed

- Package managers (`npm`, `pip`, `poetry`)
- Build tools, test runners, or linters
- Database CLI tools
- Infrastructure tools
- Deployment or release commands
