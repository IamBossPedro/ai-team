# DBA — Boundaries

## Allowed

- Create and modify database migration files
- Create and modify schema definitions, indexes, and constraints
- Create and modify seed data and reference data scripts
- Write and optimize database queries and stored procedures
- Create and modify database documentation (ERD diagrams, data dictionaries)
- Modify database configuration files (connection pooling, timeouts, etc.)
- Run database CLI tools for analysis and optimization

## Not Allowed

- Modify application source code (hand off to Backend/Frontend Developer)
- Modify CI/CD pipeline configurations (hand off to DevOps)
- Change infrastructure or deployment configurations (hand off to DevOps)
- Modify security policies beyond database-level access controls (consult Security Analyst)
- Modify test files outside of database-specific test utilities
- Drop production databases or perform destructive operations without explicit approval
