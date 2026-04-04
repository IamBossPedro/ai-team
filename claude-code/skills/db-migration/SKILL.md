# Database Migration Review and Creation

Review existing database migrations or create new ones with proper rollback plans and data integrity checks.

## Trigger

Use this skill when asked to create a database migration, review a migration, or make schema changes.

## Instructions

### Mode Detection

Determine the mode based on the user's request:
- **Create mode:** User wants a new migration for a schema change
- **Review mode:** User wants to review an existing migration file

---

### Create Mode

#### Step 1: Understand the Schema Change

Gather the following from the user:
- What tables and columns are affected?
- What is the business reason for the change?
- Is this additive (new table, new column) or destructive (drop, rename, alter type)?
- Is there existing data that needs to be transformed?

#### Step 2: Detect the Migration Framework

Look for migration tooling in the project:
- **Prisma:** Check for `prisma/schema.prisma`
- **Drizzle:** Check for `drizzle.config.*` or `drizzle/`
- **Knex:** Check for `knexfile.*`
- **TypeORM:** Check for `ormconfig.*` or `data-source.*`
- **Sequelize:** Check for `.sequelizerc` or `config/config.json`
- **Raw SQL:** Check for `migrations/` with `.sql` files
- **Django:** Check for `*/migrations/` directories
- **Alembic:** Check for `alembic.ini` or `alembic/`

Use the detected framework's conventions for file naming and structure.

#### Step 3: Write the Migration

Create the migration file with:

1. **Header comment** explaining the purpose, ticket reference, and date
2. **Up migration** with the schema changes
3. **Down migration** that fully reverses the up migration
4. **Data migration** if existing rows need transformation

Follow these rules:
- Use explicit column types with lengths (e.g., `VARCHAR(255)` not `VARCHAR`)
- Add NOT NULL constraints where appropriate with sensible defaults
- Create indexes for foreign keys and frequently queried columns
- Use UUID or BIGINT for primary keys (not auto-increment INT for new tables)
- Add `created_at` and `updated_at` timestamps to new tables
- Foreign keys must specify ON DELETE behavior (CASCADE, SET NULL, or RESTRICT)

#### Step 4: Write Data Integrity Checks

After the migration, include validation queries:
```sql
-- Verify row counts are preserved
-- Verify no NULL values in NOT NULL columns
-- Verify foreign key relationships are intact
-- Verify unique constraints hold
```

#### Step 5: Document the Migration

Include in the migration file or a companion document:
- Purpose of the change
- Impact on existing data
- Rollback procedure
- Estimated execution time for large tables
- Whether the migration requires downtime

---

### Review Mode

#### Step 1: Read the Migration File

Read the migration file(s) provided or find recent uncommitted migration files.

#### Step 2: Check for Issues

Evaluate the migration against these criteria:

**Correctness**
- Does the up migration achieve the stated goal?
- Does the down migration fully reverse the up migration?
- Are data types appropriate for the data being stored?
- Are constraints (NOT NULL, UNIQUE, CHECK) correct?

**Safety**
- Does the migration lock tables for extended periods on large datasets?
- Are there operations that could fail on tables with existing data (e.g., adding NOT NULL without a default)?
- Is the migration idempotent or does it fail if run twice?
- Are there race conditions with concurrent application access?

**Performance**
- Will index creation block writes on large tables? (Consider CONCURRENTLY for PostgreSQL)
- Are there full table scans in data migrations?
- Is the migration batched for large data transformations?
- What is the estimated execution time?

**Rollback**
- Is the down migration present and complete?
- Can the rollback be executed without data loss?
- Are there edge cases where rollback would fail?

**Conventions**
- Does the file name follow the project's naming convention?
- Is the migration timestamp or version number correct?
- Are table and column names consistent with existing schema?

#### Step 3: Produce the Review

```
## Migration Review

**File:** <migration file path>
**Type:** <additive | destructive | data-only>
**Risk Level:** <low | medium | high>

### Summary
<What this migration does>

### Issues Found

#### Must Fix
- [ ] <Issue with explanation and fix>

#### Should Fix
- [ ] <Issue with explanation and fix>

#### Recommendations
- [ ] <Suggestion>

### Rollback Assessment
- **Rollback available:** yes/no
- **Data loss on rollback:** yes/no
- **Estimated rollback time:** <duration>

### Execution Estimate
- **Estimated duration:** <duration>
- **Downtime required:** yes/no
- **Blocking operations:** <list>

### Verdict: APPROVE / REQUEST_CHANGES
```
