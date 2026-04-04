# Run and Analyze Tests

Execute the project's test suite, analyze results, identify failures, and suggest fixes.

## Trigger

Use this skill when asked to run tests, check test results, fix failing tests, or analyze test coverage.

## Instructions

### Step 1: Detect the Test Framework

Look for test configuration in the project:

| Framework | Detection |
|-----------|-----------|
| Jest | `jest.config.*`, `"jest"` in package.json |
| Vitest | `vitest.config.*`, `"vitest"` in package.json |
| Mocha | `.mocharc.*`, `"mocha"` in package.json |
| Pytest | `pytest.ini`, `pyproject.toml [tool.pytest]`, `conftest.py` |
| Go test | `*_test.go` files |
| Cargo test | `Cargo.toml` with `[dev-dependencies]` |
| PHPUnit | `phpunit.xml` |
| RSpec | `.rspec`, `spec/` directory |
| Playwright | `playwright.config.*` |
| Cypress | `cypress.config.*` |

Check `package.json` scripts for the test command: look for `"test"`, `"test:unit"`, `"test:integration"`, `"test:e2e"`.

### Step 2: Run the Tests

Execute the appropriate test command:

```bash
# Use the project's configured test command
npm test          # or npm run test:unit, yarn test, pnpm test
pytest            # Python
go test ./...     # Go
cargo test        # Rust
```

If the user specified particular tests or files, run only those:
```bash
npm test -- --testPathPattern="<pattern>"
pytest <path>
go test ./<package>/...
```

Capture the full output including:
- Pass/fail counts
- Error messages and stack traces
- Test duration
- Coverage report (if available)

### Step 3: Analyze Results

#### If All Tests Pass

Report the results:
```
## Test Results: ALL PASSING

**Total:** <count> tests
**Passed:** <count>
**Duration:** <time>

No action required.
```

If coverage data is available, report coverage gaps:
```
### Coverage Summary

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| ... | ...% | ...% | ...% | ...% |

### Uncovered Areas
- <file>: Lines <range> - <description of what's untested>
```

#### If Tests Fail

For each failing test, analyze:

1. **Read the test code** to understand what it expects
2. **Read the source code** it tests to understand the current behavior
3. **Compare expected vs actual** to identify the root cause
4. **Classify the failure:**
   - **Source bug:** The application code is wrong, the test is correct
   - **Test bug:** The test is wrong or outdated, the application code is correct
   - **Environment issue:** Missing dependency, wrong config, flaky timing
   - **Integration issue:** External service or database state problem

### Step 4: Produce the Report

```markdown
## Test Results

**Total:** <count> | **Passed:** <count> | **Failed:** <count> | **Skipped:** <count>
**Duration:** <time>

---

### Failures

#### 1. <Test Name>

- **File:** `<test file path>`
- **Error:** `<error message>`
- **Classification:** <source bug | test bug | environment | integration>

**Expected behavior:**
<what the test expects>

**Actual behavior:**
<what actually happened>

**Root cause:**
<why the test is failing>

**Suggested fix:**
<specific code change with file and line reference>

\```diff
- <old code>
+ <new code>
\```

---

<repeat for each failure>

### Summary

| Classification | Count | Action |
|---------------|-------|--------|
| Source bugs | <n> | Fix application code |
| Test bugs | <n> | Update tests |
| Environment | <n> | Fix configuration |
| Integration | <n> | Check external dependencies |
```

### Step 5: Fix Failures (if requested)

If the user asks to fix failing tests:

1. Fix one failure at a time, starting with source bugs
2. After each fix, re-run the affected test to verify
3. Do not modify test expectations to make tests pass unless the test is genuinely wrong
4. If a fix in one file causes failures in another, investigate the relationship before proceeding

### Rules

- Always run tests before claiming they pass. Never assume.
- Never delete or skip failing tests to make the suite green.
- If tests are flaky (pass sometimes, fail sometimes), flag them explicitly.
- If the test suite takes more than 5 minutes, inform the user and offer to run a subset.
- Do not install new test dependencies without user approval.
- Preserve test isolation. Fixes should not make tests depend on execution order.
