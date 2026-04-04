# Agent Guidelines for ai-team Development

These guidelines define how Claude should work when developing on this repository.

## General rules

- This is a monorepo with npm workspaces. Always run npm commands from the repo root.
- Prefer editing existing files over creating new ones.
- Do not create documentation files unless explicitly asked.
- Run `npm run build` after changing TypeScript code to verify compilation.
- Run `npm test` before considering a task complete.
- For Python changes, run `pytest` from `packages/python/`.

## TypeScript conventions

- Use strict TypeScript with no `any` types unless unavoidable.
- Export public API from `packages/typescript/src/index.ts`.
- Tests use vitest and live in `packages/typescript/tests/`.
- Follow the existing patterns in `packages/typescript/src/roles/` when adding new roles.

## Python conventions

- Use type hints on all public functions and classes.
- Format with ruff, type-check with mypy.
- Tests use pytest and live in `packages/python/tests/`.
- Package source lives in `packages/python/src/tcs_bpi_ai_team/`.

## Role definitions

- Canonical role definitions are markdown files in `roles/`.
- Each role has a `_base` set of instructions plus role-specific content.
- When adding a new role, create the markdown file in `roles/` first, then implement the TypeScript and Python modules.

## Code review

- Check that new code has corresponding tests.
- Verify types are correct and complete.
- Ensure role definitions stay in sync across markdown, TypeScript, and Python.
