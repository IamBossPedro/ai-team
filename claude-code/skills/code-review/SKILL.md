# Code Review

Perform a structured code review on changed files. Analyze diffs for correctness, security, test coverage, performance, and style.

## Trigger

Use this skill when asked to review code, review a PR, or review changes.

## Instructions

### Step 1: Gather Changes

Run `git diff --cached` to see staged changes. If nothing is staged, run `git diff` for unstaged changes. If reviewing a PR, run `git diff main...HEAD` (adjust base branch as needed).

If no changes are found, inform the user and stop.

### Step 2: Identify Changed Files

List all changed files and categorize them:
- **Source code** (application logic)
- **Tests** (test files)
- **Configuration** (config, CI/CD, build files)
- **Documentation** (markdown, comments)
- **Migrations** (database schema changes)

### Step 3: Review Each File

For every changed source file, evaluate the following dimensions:

#### Correctness and Logic
- Are there off-by-one errors, null pointer risks, or unhandled edge cases?
- Does the logic match the stated intent (commit message, PR description)?
- Are return types and error handling consistent?
- Are race conditions possible in concurrent code paths?

#### Security
- Is user input validated and sanitized before use?
- Are there SQL injection, XSS, or CSRF vulnerabilities?
- Are secrets or credentials hardcoded?
- Are authentication and authorization checks present where needed?
- Are dependencies being used securely (no `eval`, no unsafe deserialization)?

#### Test Coverage
- Do new functions and branches have corresponding tests?
- Are edge cases and error paths tested?
- Is there a test file for each changed source file?
- Do existing tests still pass with these changes (check for broken assumptions)?

#### Performance
- Are there N+1 query patterns or unnecessary database calls?
- Are large collections processed efficiently (pagination, streaming, batching)?
- Are there memory leaks (unclosed resources, growing caches)?
- Could any synchronous operations be made async?

#### Code Style and Conventions
- Does the code follow the project's naming conventions?
- Are functions and variables named descriptively?
- Is dead code being introduced or left behind?
- Are magic numbers or hardcoded strings extracted to constants?
- Is the code DRY without being over-abstracted?

### Step 4: Produce the Review

Output a structured review in the following format:

```
## Code Review Summary

**Files reviewed:** <count>
**Issues found:** <count by severity>

---

### Critical (must fix before merge)
- [ ] **[FILE:LINE]** Description of the issue
  - **Why:** Explanation of the risk
  - **Fix:** Suggested remediation

### Warning (should fix, acceptable to defer)
- [ ] **[FILE:LINE]** Description of the issue
  - **Why:** Explanation of the risk
  - **Fix:** Suggested remediation

### Info (suggestions and style)
- [ ] **[FILE:LINE]** Description of the suggestion
  - **Why:** Explanation of the improvement

### Positive Observations
- Highlight well-written code, good patterns, or thorough tests

---

**Verdict:** APPROVE / REQUEST_CHANGES / NEEDS_DISCUSSION
```

### Severity Definitions

| Severity | Meaning |
|----------|---------|
| **Critical** | Bugs, security vulnerabilities, data loss risks, or broken functionality. Must be fixed. |
| **Warning** | Code smells, missing tests, performance concerns, or maintainability issues. Should be fixed. |
| **Info** | Style suggestions, naming improvements, or documentation gaps. Nice to fix. |

### Rules

- Be specific. Always include the file path and line number.
- Be constructive. Every issue must include a suggested fix or direction.
- Be balanced. Call out good patterns alongside problems.
- Do not nitpick formatting if a linter or formatter is configured in the project.
- If you are unsure about a potential issue, flag it as Info with a question rather than asserting it is a problem.
