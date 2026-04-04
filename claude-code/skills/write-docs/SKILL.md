# Write Documentation

Generate or update documentation for the project including API docs, README sections, inline comments, and guides.

## Trigger

Use this skill when asked to write documentation, generate API docs, update the README, or document code.

## Instructions

### Step 1: Determine Documentation Type

Based on the user's request, identify the type:
- **API documentation:** Endpoint references with request/response examples
- **README section:** Setup, usage, configuration, or contribution guides
- **Inline comments:** Code-level documentation for complex logic
- **Architecture docs:** System design, data flow, component relationships
- **Changelog entry:** Description of changes for a release
- **Onboarding guide:** Getting started instructions for new developers

### Step 2: Gather Context

Read the relevant source files to understand:
- What does the code actually do? (Never guess from function names alone)
- What are the inputs, outputs, and side effects?
- What dependencies and prerequisites exist?
- What configuration is required?
- What error conditions are possible?

For API docs, read the route handlers, middleware, and validation schemas.
For README updates, read the existing README and project configuration files.

### Step 3: Write the Documentation

Follow these principles:

**Accuracy above all.** Every statement must be verifiable from the source code. If you are unsure, say so rather than guessing.

**Structure for scanning.** Use headings, bullet points, and code blocks. Developers scan documentation, they do not read it linearly.

**Show, don't tell.** Include realistic code examples for every concept. Use the project's actual data models and variable names.

**Explain the "why."** Document why a decision was made or why a parameter exists, not just what it does.

**Keep it maintainable.** Do not duplicate information. Reference other docs instead of copying content.

### API Documentation Format

For each endpoint:

```markdown
### <METHOD> <path>

<One-sentence description of what this endpoint does.>

**Authentication:** <required | optional | none>
**Authorization:** <roles or permissions required>

#### Request

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| id        | path     | string | yes    | The resource identifier |
| limit     | query    | number | no     | Max results (default: 20, max: 100) |

**Body:**
\```json
{
  "field": "value",
  "nested": {
    "key": "value"
  }
}
\```

#### Response

**200 OK**
\```json
{
  "data": { ... },
  "meta": {
    "total": 42,
    "page": 1
  }
}
\```

**400 Bad Request**
\```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description of what went wrong",
    "details": [...]
  }
}
\```

#### Example

\```bash
curl -X POST https://api.example.com/resource \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
\```
```

### README Section Format

For setup and usage sections:

```markdown
## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- ...

### Installation

\```bash
git clone <repo-url>
cd <project>
npm install
cp .env.example .env
\```

### Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | yes | - | PostgreSQL connection string |
| ...      | ...      | ...     | ...         |

### Running Locally

\```bash
npm run dev
\```

The application starts at `http://localhost:3000`.
```

### Inline Comment Guidelines

- Add comments for complex business logic, non-obvious algorithms, and workarounds.
- Use JSDoc/TSDoc/docstring format for public function signatures.
- Do not comment obvious code (`i++ // increment i`).
- Reference ticket numbers for workarounds: `// HACK: Workaround for BUG-1234`.
- Keep comments up to date with the code they describe.

### Step 4: Validate

After writing documentation:
- Verify all file paths and command examples are correct by checking the source
- Ensure code examples match the current API signatures
- Check that configuration variables match what the code actually reads
- Confirm that URLs and links are valid

### Rules

- Never invent API endpoints or parameters that do not exist in the codebase.
- Never hardcode version numbers unless reading them from package.json or equivalent.
- Use the project's actual terminology, not generic placeholder names.
- If the project has a docs/ directory, place documentation files there. Otherwise ask the user.
- Match the existing documentation style (tone, formatting, heading levels).
