@AGENTS.md

# AI Team Monorepo

This is a monorepo containing TypeScript and Python packages for the TCS-BPI shared AI agent team library.

## Structure

- `packages/typescript/` -- TypeScript SDK (npm workspace)
- `packages/python/` -- Python SDK
- `cli/` -- Command-line interface (npm workspace)
- `roles/` -- Role definition markdown files consumed by both SDKs
- `examples/` -- Usage examples
- `docs/` -- Documentation

## Development

- TypeScript: `npm install` at root, then `npm run build` and `npm test`
- Python: `cd packages/python && pip install -e ".[dev]"` then `pytest`
- CI runs on push to main and on all PRs

## Key conventions

- Role definitions live in `roles/` as markdown and are the source of truth
- TypeScript role modules in `packages/typescript/src/roles/` mirror the markdown roles
- Python role modules go in `packages/python/src/tcs_bpi_ai_team/roles/`
- All public API surfaces must have types (TypeScript) or type hints (Python)
