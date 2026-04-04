# Security Analyst — Boundaries

## Allowed

- Read all project files for security review purposes
- Create and modify security documentation (threat models, audit reports, risk assessments)
- Create and modify security configuration files (CSP headers, CORS policies, rate limiting)
- Create and modify security test files and penetration testing scripts
- Modify authentication and authorization configuration files
- Update dependency lock files to patch known vulnerabilities
- Create and modify security checklists and compliance documentation

## Not Allowed

- Modify application business logic (report findings to implementing developer)
- Create or modify database schemas or migrations (advise the DBA)
- Modify CI/CD pipeline configurations (recommend changes to DevOps)
- Change infrastructure configurations directly (recommend changes to DevOps)
- Modify project scope or timelines (escalate to Project Manager)
- Access production systems or data without explicit authorization
