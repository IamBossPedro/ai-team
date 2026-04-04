# Security Audit

Perform a comprehensive security audit of the codebase covering OWASP Top 10, dependency vulnerabilities, secrets detection, and security best practices.

## Trigger

Use this skill when asked to perform a security audit, check for vulnerabilities, or review security posture.

## Instructions

### Step 1: Define Scope

Determine the audit scope:
- **Full audit:** Entire codebase (default if no scope specified)
- **Targeted audit:** Specific directories or files provided by the user
- **Diff audit:** Only changes since a given commit or branch

### Step 2: OWASP Top 10 Analysis

Check the codebase for each category:

#### A01 - Broken Access Control
- Search for endpoints missing authentication middleware
- Check for missing authorization checks (role-based, ownership-based)
- Look for direct object reference vulnerabilities (IDOR)
- Verify that CORS policies are restrictive and intentional
- Check for path traversal patterns in file handling

#### A02 - Cryptographic Failures
- Identify weak hashing algorithms (MD5, SHA1 for passwords)
- Check for missing encryption on sensitive data at rest
- Verify TLS configuration for external connections
- Look for hardcoded encryption keys or IVs
- Check that password hashing uses bcrypt, scrypt, or argon2

#### A03 - Injection
- Search for string concatenation in SQL queries
- Check for template injection in server-side rendering
- Look for command injection via `exec`, `spawn`, `system` calls
- Verify ORM usage is parameterized
- Check for LDAP, XML, and NoSQL injection patterns

#### A04 - Insecure Design
- Review authentication flows for logic flaws
- Check rate limiting on sensitive endpoints (login, password reset)
- Verify that business logic enforces proper state transitions
- Look for missing input validation at trust boundaries

#### A05 - Security Misconfiguration
- Check for debug mode enabled in production configs
- Look for default credentials in configuration files
- Verify security headers (CSP, HSTS, X-Frame-Options)
- Check for overly permissive file permissions
- Review error handling for information leakage

#### A06 - Vulnerable Components
- Run `npm audit`, `pip audit`, `cargo audit`, or equivalent for the project's language
- Check lock files for known vulnerable versions
- Identify outdated dependencies with known CVEs
- Flag dependencies that are unmaintained (no updates in 2+ years)

#### A07 - Authentication Failures
- Check session management (secure cookies, proper expiration)
- Look for weak password policies
- Verify multi-factor authentication where appropriate
- Check for credential stuffing protections
- Review token generation for sufficient entropy

#### A08 - Data Integrity Failures
- Check for unsigned or unverified data in deserialization
- Look for missing integrity checks on software updates or plugins
- Verify CI/CD pipeline security (no unsigned artifacts)

#### A09 - Logging and Monitoring Failures
- Check that authentication events are logged
- Verify that sensitive data is not written to logs
- Look for adequate error logging with context
- Check for log injection vulnerabilities

#### A10 - Server-Side Request Forgery (SSRF)
- Search for user-controlled URLs in server-side HTTP requests
- Check for URL validation and allowlisting
- Verify that internal network addresses are blocked

### Step 3: Secrets Detection

Scan the codebase for leaked secrets:

- Search for patterns: API keys, tokens, passwords, connection strings
- Check `.env` files, config files, and source code
- Verify `.gitignore` excludes sensitive files
- Check git history for previously committed secrets: `git log --all -p -S "password" --diff-filter=A`
- Look for base64-encoded secrets

Common patterns to grep for:
```
API_KEY, SECRET_KEY, ACCESS_TOKEN, PRIVATE_KEY,
password=, passwd=, secret=, token=,
-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----
mongodb://, postgres://, mysql:// (with credentials)
```

### Step 4: Dependency Analysis

- List all direct and transitive dependencies
- Cross-reference with CVE databases
- Identify dependencies with known vulnerabilities and their severity
- Check for typosquatting risks on dependency names
- Verify that lock files are committed and up to date

### Step 5: Produce the Report

Output a structured security report:

```
## Security Audit Report

**Scope:** <full | targeted | diff>
**Date:** <current date>
**Files scanned:** <count>

---

### Executive Summary

<2-3 sentence overview of the security posture and most critical findings>

---

### Findings by Severity

#### CRITICAL (immediate action required)
- **[VULN-001]** <Title>
  - **Category:** <OWASP category>
  - **Location:** <file:line>
  - **Description:** <what the vulnerability is>
  - **Impact:** <what an attacker could do>
  - **Remediation:** <specific fix with code example if applicable>

#### HIGH (fix before next release)
- **[VULN-002]** ...

#### MEDIUM (fix within current sprint)
- **[VULN-003]** ...

#### LOW (track and address)
- **[VULN-004]** ...

#### INFORMATIONAL (best practice recommendations)
- **[INFO-001]** ...

---

### Dependency Vulnerabilities

| Package | Current Version | Vulnerability | Severity | Fixed In |
|---------|----------------|---------------|----------|----------|
| ...     | ...            | CVE-XXXX-XXXX | ...      | ...      |

---

### Secrets Scan Results

| Finding | File | Status |
|---------|------|--------|
| ...     | ...  | LEAKED / FALSE_POSITIVE |

---

### Recommendations

1. <Prioritized list of actions>
```

### Severity Definitions

| Severity | Criteria |
|----------|----------|
| **Critical** | Actively exploitable, data breach risk, no authentication bypass |
| **High** | Exploitable with moderate effort, significant data exposure |
| **Medium** | Requires specific conditions to exploit, limited impact |
| **Low** | Theoretical risk, defense-in-depth improvement |
| **Informational** | Best practice recommendation, no direct risk |
