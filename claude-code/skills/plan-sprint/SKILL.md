# Sprint Planning

Break down features into actionable tasks, estimate effort, identify dependencies, and produce a prioritized sprint plan.

## Trigger

Use this skill when asked to plan a sprint, break down a feature, estimate work, or create a task list.

## Instructions

### Step 1: Understand the Input

The user will provide one or more of:
- A feature description or user story
- A list of requirements or acceptance criteria
- A reference to issues, tickets, or a product brief
- A high-level goal for the sprint

If the input is vague, ask clarifying questions before proceeding:
- What is the business outcome?
- Who are the users affected?
- Are there hard deadlines or dependencies on other teams?
- What is the team's capacity (number of developers, sprint length)?

### Step 2: Analyze the Codebase

Read relevant source files to understand:
- Which parts of the codebase will be affected?
- What existing patterns and abstractions can be reused?
- What testing infrastructure exists?
- Are there related features that suggest implementation patterns?

This step is critical for producing accurate estimates and identifying hidden complexity.

### Step 3: Break Down into Tasks

For each feature or requirement, create tasks that follow these rules:

1. **1-3 day scope.** No task should take more than 3 days. If it does, break it down further.
2. **Single responsibility.** Each task should have one clear deliverable.
3. **Testable outcome.** Each task must have a verifiable definition of done.
4. **Explicit dependencies.** State which tasks block others.

For each task, include:
- **Title:** Short, action-oriented (e.g., "Add validation to user registration endpoint")
- **Description:** What needs to be done and why
- **Acceptance criteria:** Specific, testable conditions for completion
- **Estimate:** T-shirt size (XS, S, M, L) and approximate hours/days
- **Dependencies:** Which tasks must be completed first
- **Role:** Which role should own this task (backend, frontend, dba, etc.)
- **Files likely affected:** List of files or directories

### Step 4: Estimate Effort

Use this sizing guide:

| Size | Duration | Complexity |
|------|----------|------------|
| **XS** | < 2 hours | Simple change, clear path, no unknowns |
| **S** | 2-4 hours | Straightforward, minor unknowns |
| **M** | 1-2 days | Moderate complexity, some design decisions |
| **L** | 2-3 days | Complex, multiple components, needs testing strategy |

If a task would be **XL** (3+ days), it must be decomposed further.

Include buffer time:
- Add 20% for testing and code review
- Add 10% for unexpected issues and context switching
- For tasks with high uncertainty, add a spike/research task first

### Step 5: Prioritize

Order tasks using this framework:

1. **Critical path first.** Tasks that block other tasks go to the top.
2. **Risk reduction.** Tackle uncertain or complex tasks early in the sprint.
3. **Value delivery.** Prefer tasks that deliver user-visible value sooner.
4. **Dependency ordering.** Backend before frontend, schema before data, infra before deploy.

### Step 6: Produce the Sprint Plan

```markdown
## Sprint Plan: <Sprint Name or Goal>

**Sprint goal:** <One sentence describing the outcome>
**Duration:** <X days/weeks>
**Team capacity:** <X developer-days>
**Total estimated effort:** <X developer-days>
**Buffer:** <X developer-days>

---

### Critical Path

<Visual dependency chain>
Task A -> Task B -> Task C
              \-> Task D -> Task E

---

### Task Breakdown

#### Epic: <Feature Name>

| # | Task | Size | Est. | Role | Depends On | Status |
|---|------|------|------|------|------------|--------|
| 1 | <title> | S | 4h | backend | - | TODO |
| 2 | <title> | M | 1.5d | backend | #1 | TODO |
| 3 | <title> | S | 3h | frontend | #2 | TODO |
| 4 | <title> | M | 1d | qa | #2, #3 | TODO |

**Task 1: <Title>**
- Description: <what and why>
- Acceptance criteria:
  - [ ] <criterion 1>
  - [ ] <criterion 2>
- Files likely affected: `src/...`, `test/...`

<repeat for each task>

---

### Risks and Unknowns

| Risk | Impact | Mitigation |
|------|--------|------------|
| <risk> | <impact> | <what to do about it> |

---

### Sprint Velocity Check

- Total estimated: <X> developer-days
- Available capacity: <X> developer-days
- Utilization: <X>% (aim for 70-80%)
- Recommendation: <on track | over-committed | room for more>
```

### Rules

- Never estimate without reading the relevant code first.
- Flag tasks that require cross-team coordination.
- Include testing tasks explicitly. They are not free.
- If capacity is exceeded, recommend what to defer with rationale.
- Highlight tasks with high uncertainty and recommend spikes.
