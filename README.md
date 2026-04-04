# @tcs-bpi/ai-team

[![CI](https://github.com/TCS-BPI/ai-team/actions/workflows/ci.yml/badge.svg)](https://github.com/TCS-BPI/ai-team/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Shared AI agent team library for the TCS-BPI organization. Provides pre-configured agent roles, orchestration utilities, and tool definitions for building multi-agent systems with the Anthropic Claude API.

## Quick Start

### npm (TypeScript)

```bash
npm install @tcs-bpi/ai-team --registry=https://npm.pkg.github.com
```

### pip (Python)

```bash
pip install tcs-bpi-ai-team
```

### CLI

```bash
npx @tcs-bpi/ai-team-cli
```

### Git submodule

```bash
git submodule add https://github.com/TCS-BPI/ai-team.git lib/ai-team
```

## Architecture

```
ai-team/
  packages/
    typescript/     # TypeScript SDK (@tcs-bpi/ai-team)
    python/         # Python SDK (tcs-bpi-ai-team)
  cli/              # CLI tool (@tcs-bpi/ai-team-cli)
  roles/            # Canonical role definitions (markdown)
  examples/         # Usage examples
  docs/             # Documentation
```

The `roles/` directory contains the source-of-truth role definitions as markdown files. Both the TypeScript and Python SDKs consume these definitions to provide typed role configurations.

## Roles

| Role | Description |
|------|-------------|
| **Project Manager** | Sprint planning, task breakdown, progress tracking |
| **Tech Lead** | Architecture decisions, code review, technical direction |
| **Frontend Developer** | UI components, client-side logic, accessibility |
| **Backend Developer** | API design, server logic, data modeling |
| **DBA** | Database schema design, query optimization, migrations |
| **DevOps Engineer** | CI/CD pipelines, infrastructure, deployment |
| **QA Engineer** | Test strategy, test automation, quality assurance |
| **Security Analyst** | Threat modeling, security review, compliance |
| **Technical Writer** | Documentation, API references, user guides |

## Usage

### TypeScript

```typescript
import { createAgent, roles } from "@tcs-bpi/ai-team";

const techLead = createAgent({
  role: roles.techLead,
  model: "claude-sonnet-4-20250514",
});

const response = await techLead.run(
  "Review this pull request for architectural concerns."
);
```

### Python

```python
from tcs_bpi_ai_team import create_agent, roles

tech_lead = create_agent(
    role=roles.tech_lead,
    model="claude-sonnet-4-20250514",
)

response = await tech_lead.run(
    "Review this pull request for architectural concerns."
)
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Python development
cd packages/python
pip install -e ".[dev]"
pytest
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes with tests
4. Ensure `npm run build` and `npm test` pass
5. Submit a pull request against `main`

Please follow the conventions defined in `AGENTS.md` when contributing.

## License

MIT
