# Usage Guide

Comprehensive guide to using the `@tcs-bpi/ai-team` library across all three supported approaches: Claude Code, the Python SDK, and the TypeScript SDK.

---

## Table of Contents

- [Overview](#overview)
- [Roles Reference](#roles-reference)
- [When to Use Each Approach](#when-to-use-each-approach)
- [Approach 1: Claude Code](#approach-1-claude-code)
  - [Setup](#claude-code-setup)
  - [Role Switching](#role-switching)
  - [Skills](#skills)
  - [Examples for activity-planner](#claude-code-activity-planner-examples)
  - [Examples for db-housekeeping](#claude-code-db-housekeeping-examples)
- [Approach 2: Python SDK](#approach-2-python-sdk)
  - [Installation](#python-installation)
  - [Prerequisites](#python-prerequisites)
  - [Basic Usage](#python-basic-usage)
  - [Examples for db-housekeeping](#python-db-housekeeping-examples)
  - [Examples for activity-planner](#python-activity-planner-examples)
  - [Factory Function](#factory-function)
  - [Observability: Logger and Tracer](#observability-logger-and-tracer)
- [Approach 3: TypeScript SDK](#approach-3-typescript-sdk)
  - [Installation](#typescript-installation)
  - [Basic Usage](#typescript-basic-usage)
  - [YAML Pipeline Loading](#yaml-pipeline-loading)
  - [Logging and Tracing](#logging-and-tracing)
  - [Context Summarization](#context-summarization)
- [Custom Pipelines](#custom-pipelines)
  - [Defining Pipelines in Code](#defining-pipelines-in-code)
  - [Defining Pipelines in YAML](#defining-pipelines-in-yaml)
- [Built-in Pipelines](#built-in-pipelines)
- [Advanced Features](#advanced-features)
  - [Parallel Execution](#parallel-execution)
  - [Context Summarization](#context-summarization-advanced)
  - [YAML Pipeline Loading](#yaml-pipeline-loading-advanced)
- [Troubleshooting](#troubleshooting)

---

## Overview

The `@tcs-bpi/ai-team` library provides 9 pre-configured agent roles that model a complete software development team. Each role has a system prompt, boundary definitions, and tool lists derived from canonical markdown files in the `roles/` directory.

The library supports three consumption patterns:

1. **Claude Code** -- Use roles as Claude Code personas with built-in skills. No API key required. Best for interactive, developer-in-the-loop workflows.
2. **Python SDK** (`tcs-bpi-ai-team`) -- Programmatic orchestration via Python. Best for scripting, CI/CD integration, and automation of shell-based projects like db-housekeeping.
3. **TypeScript SDK** (`@tcs-bpi/ai-team`) -- Programmatic orchestration via TypeScript. Best for integration into Node.js applications and Next.js projects like activity-planner.

---

## Roles Reference

All 9 roles and their slug identifiers:

| Role | Slug | Enum (Python) | Enum (TypeScript) | Specialization |
|------|------|---------------|-------------------|----------------|
| Project Manager | `project-manager` | `AgentRole.PROJECT_MANAGER` | `AgentRole.ProjectManager` | Sprint planning, task breakdown, progress tracking |
| Tech Lead | `tech-lead` | `AgentRole.TECH_LEAD` | `AgentRole.TechLead` | Architecture decisions, code review, technical direction |
| Frontend Developer | `frontend-developer` | `AgentRole.FRONTEND_DEVELOPER` | `AgentRole.FrontendDeveloper` | UI components, client-side logic, accessibility |
| Backend Developer | `backend-developer` | `AgentRole.BACKEND_DEVELOPER` | `AgentRole.BackendDeveloper` | API design, server logic, data modeling |
| DBA | `dba` | `AgentRole.DBA` | `AgentRole.DBA` | Database schema design, query optimization, migrations |
| DevOps Engineer | `devops-engineer` | `AgentRole.DEVOPS_ENGINEER` | `AgentRole.DevOpsEngineer` | CI/CD pipelines, infrastructure, deployment |
| QA Engineer | `qa-engineer` | `AgentRole.QA_ENGINEER` | `AgentRole.QAEngineer` | Test strategy, test automation, quality assurance |
| Security Analyst | `security-analyst` | `AgentRole.SECURITY_ANALYST` | `AgentRole.SecurityAnalyst` | Threat modeling, security review, compliance |
| Technical Writer | `technical-writer` | `AgentRole.TECHNICAL_WRITER` | `AgentRole.TechnicalWriter` | Documentation, API references, user guides |

---

## When to Use Each Approach

| Scenario | Recommended Approach |
|----------|---------------------|
| Interactive code review during development | Claude Code |
| One-off sprint planning session | Claude Code |
| Automated nightly security audit in CI | Python SDK |
| Building a Korn shell monitoring script with DBA guidance | Python SDK |
| Integrating agent pipelines into a Next.js API route | TypeScript SDK |
| Loading custom YAML pipeline definitions at runtime | Python SDK or TypeScript SDK |
| Quick ad-hoc task with no setup | Claude Code |

---

## Approach 1: Claude Code

Claude Code is the fastest way to use ai-team roles. It requires no API key (Claude Code handles authentication) and provides an interactive, conversational interface.

### Claude Code Setup

Add the ai-team repo as a git submodule in your project:

```bash
cd your-project
git submodule add https://github.com/IamBossPedro/TCS-BPI-SOW5-DBA-ai-team.git lib/ai-team
```

Then copy the skills you need into your project's `.claude/skills/` directory:

```bash
mkdir -p .claude/skills
cp -r lib/ai-team/claude-code/skills/* .claude/skills/
```

The available skills are installed as directories under `.claude/skills/`, each containing a `SKILL.md` file that Claude Code reads automatically.

### Role Switching

In a Claude Code session, you can ask Claude to adopt any of the 9 roles. The role's system prompt and boundary definitions are loaded from the `roles/` directory:

```
# Ask Claude Code to act as the DBA role
"Switch to the DBA role and review this migration file."

# Ask Claude Code to act as the Tech Lead
"As the Tech Lead, review the architecture of the activity-planner src/ directory."

# Ask Claude Code to act as the QA Engineer
"As the QA Engineer, analyze the test coverage of db-housekeeping scripts."
```

### Skills

The following skills are available for Claude Code sessions:

| Skill | Directory | What It Does |
|-------|-----------|-------------|
| Code Review | `code-review/` | Structured code review with severity levels (Critical, Warning, Info) |
| Security Audit | `security-audit/` | OWASP Top 10 analysis, secrets detection, dependency audit |
| DB Migration | `db-migration/` | Create or review database migrations with rollback plans |
| Write Docs | `write-docs/` | Generate API docs, README sections, inline comments, guides |
| Plan Sprint | `plan-sprint/` | Break features into tasks, estimate effort, produce sprint plans |
| Run Tests | `run-tests/` | Execute tests, analyze failures, suggest fixes |

### Claude Code activity-planner Examples

The activity-planner is a Next.js frontend application. Example Claude Code interactions:

```
# Frontend feature planning
"As the Tech Lead, plan the implementation of a drag-and-drop activity
calendar component for the activity-planner. Break it into tasks."

# Code review of a React component
"Review the changes in src/components/ for accessibility and
performance issues."

# Sprint planning for a new feature
"As the Project Manager, plan a sprint to add user authentication
to the activity-planner. The team has 2 frontend developers and
1 backend developer for 2 weeks."

# Writing documentation
"Write API documentation for the activity-planner's route handlers
in src/app/api/."
```

### Claude Code db-housekeeping Examples

The db-housekeeping repo contains Korn shell scripts for database monitoring. Example Claude Code interactions:

```
# DBA role for script review
"As the DBA, review the tablespace monitoring script in
scripts/check_tablespace.ksh for correctness and efficiency."

# Security audit of shell scripts
"Run a security audit on the db-housekeeping scripts. Check for
SQL injection risks, hardcoded credentials, and insecure file
permissions."

# Migration creation
"As the DBA, create a migration to add a monitoring_log table
that tracks script execution history with timestamps and exit codes."

# Test analysis
"As the QA Engineer, review the test coverage of db-housekeeping
and identify which scripts lack test cases."
```

---

## Approach 2: Python SDK

The Python SDK provides programmatic access to all 9 roles with full orchestration, pipeline execution, and observability.

### Python Installation

```bash
pip install tcs-bpi-ai-team
```

Or install from source for development:

```bash
cd ai-team/packages/python
pip install -e ".[dev]"
```

### Python Prerequisites

- Python 3.11 or later
- An Anthropic API key set as the `ANTHROPIC_API_KEY` environment variable

```bash
export ANTHROPIC_API_KEY=your-api-key-here
```

The SDK uses the `anthropic` Python package internally. It is installed automatically as a dependency.

### Python Basic Usage

Create an agent, define a task, and run it through a pipeline:

```python
import asyncio

from tcs_bpi_ai_team import (
    Orchestrator,
    OrchestratorConfig,
    Task,
    TaskResult,
    TaskStatus,
    TaskType,
    HandoffRequest,
    TechLead,
    BackendDeveloper,
    QAEngineer,
)


async def main() -> None:
    # Create the orchestrator with optional callbacks
    def on_complete(result: TaskResult) -> None:
        print(f"{result.agent_role} completed (success: {result.success})")

    def on_handoff(handoff: HandoffRequest) -> None:
        print(f"Handoff: {handoff.from_role} -> {handoff.to_role} ({handoff.reason})")

    def on_error(error: Exception, task: Task) -> None:
        print(f"Error on task '{task.title}': {error}")

    config = OrchestratorConfig(
        on_task_complete=on_complete,
        on_handoff=on_handoff,
        on_error=on_error,
    )
    orchestrator = Orchestrator(config)

    # Register agents (instantiate the role classes directly)
    orchestrator.register_agents([TechLead(), BackendDeveloper(), QAEngineer()])

    # Create and submit a task
    task = Task(
        id="TASK-001",
        type=TaskType.BACKEND_FEATURE,
        title="Add user profile endpoint",
        description=(
            "Create a GET /api/users/:id/profile endpoint that returns "
            "the user's profile information."
        ),
        status=TaskStatus.CREATED,
        priority="medium",
    )

    results = await orchestrator.submit_task(task)

    for result in results:
        print(f"--- {result.agent_role} ---")
        print(result.output[:300])


if __name__ == "__main__":
    asyncio.run(main())
```

### Python db-housekeeping Examples

Use the DBA role to generate a monitoring script:

```python
import asyncio

from tcs_bpi_ai_team import (
    Orchestrator,
    OrchestratorConfig,
    Task,
    TaskStatus,
    TaskType,
    DBA,
    BackendDeveloper,
    QAEngineer,
)


async def create_monitoring_script() -> None:
    """Use the DB Migration pipeline to create a new monitoring script."""
    orchestrator = Orchestrator()
    orchestrator.register_agents([DBA(), BackendDeveloper(), QAEngineer()])

    task = Task(
        id="DBH-042",
        type=TaskType.DB_MIGRATION,
        title="Create tablespace growth monitoring script",
        description=(
            "Write a Korn shell script (check_tablespace_growth.ksh) that "
            "monitors tablespace growth trends over the past 30 days. "
            "It should query DBA_HIST_TBSPC_SPACE_USAGE, calculate daily "
            "growth rates, and alert when projected full date is within "
            "14 days. Output format: CSV with columns "
            "tablespace_name,current_pct,daily_growth_mb,projected_full_date. "
            "Exit code 1 if any tablespace is projected to fill within 14 days."
        ),
        status=TaskStatus.CREATED,
        priority="high",
    )

    # Pipeline: DBA (design) -> Backend Developer (integrate) -> QA Engineer (verify)
    results = await orchestrator.submit_task(task)

    print(f"Pipeline completed: {len(results)} stages")
    for result in results:
        print(f"\n=== {result.agent_role} ===")
        print(result.output)


if __name__ == "__main__":
    asyncio.run(create_monitoring_script())
```

Run a security review on shell scripts:

```python
import asyncio

from tcs_bpi_ai_team import (
    Orchestrator,
    Task,
    TaskStatus,
    TaskType,
    SecurityAnalyst,
    BackendDeveloper,
    SharedContext,
)


async def audit_shell_scripts() -> None:
    """Run a security review pipeline on db-housekeeping scripts."""
    orchestrator = Orchestrator()
    orchestrator.register_agents([SecurityAnalyst(), BackendDeveloper()])

    # Read the script content to pass as file context
    script_content = open("scripts/check_tablespace.ksh").read()

    task = Task(
        id="SEC-007",
        type=TaskType.SECURITY_REVIEW,
        title="Security audit of tablespace monitoring script",
        description=(
            "Audit check_tablespace.ksh for SQL injection risks, "
            "hardcoded credentials, insecure file permissions, and "
            "proper error handling. Check that Oracle credentials "
            "are sourced from a secure wallet or environment variables."
        ),
        status=TaskStatus.CREATED,
        priority="high",
        metadata={"repo": "db-housekeeping", "language": "ksh"},
    )

    # Pipeline: Security Analyst (audit) -> Backend Developer (fix) -> Security Analyst (verify)
    results = await orchestrator.submit_task(task)

    for result in results:
        print(f"--- {result.agent_role} ({result.success}) ---")
        print(result.output)


if __name__ == "__main__":
    asyncio.run(audit_shell_scripts())
```

### Python activity-planner Examples

Plan a frontend feature for the Next.js app:

```python
import asyncio

from tcs_bpi_ai_team import (
    Orchestrator,
    Task,
    TaskStatus,
    TaskType,
    TechLead,
    FrontendDeveloper,
    QAEngineer,
)


async def build_calendar_feature() -> None:
    """Use the Frontend Feature pipeline for activity-planner."""
    orchestrator = Orchestrator()
    orchestrator.register_agents([TechLead(), FrontendDeveloper(), QAEngineer()])

    task = Task(
        id="AP-015",
        type=TaskType.FRONTEND_FEATURE,
        title="Interactive activity calendar with drag-and-drop",
        description=(
            "Build a weekly calendar view component for the activity-planner "
            "Next.js app. Users should be able to drag activities between "
            "time slots. The component must be accessible (keyboard navigation, "
            "ARIA attributes) and responsive (mobile and desktop layouts). "
            "Use React Server Components where possible and client components "
            "only for interactive parts."
        ),
        status=TaskStatus.CREATED,
        priority="high",
    )

    # Pipeline: Tech Lead (plan) -> Frontend Developer (implement) -> QA Engineer (test)
    results = await orchestrator.submit_task(task)

    for result in results:
        print(f"\n=== {result.agent_role}: {result.success} ===")
        print(result.output[:500])


if __name__ == "__main__":
    asyncio.run(build_calendar_feature())
```

### Factory Function

The `create_agent` factory function creates an agent instance from a role enum value, with optional configuration overrides:

```python
from tcs_bpi_ai_team import create_agent, AgentRole

# Create with defaults
dba = create_agent(AgentRole.DBA)

# Create with custom model and token limit
tech_lead = create_agent(
    AgentRole.TECH_LEAD,
    model="claude-opus-4-20250514",
    max_tokens=8192,
    temperature=0.1,
)

# Create with a custom system prompt override
custom_agent = create_agent(
    AgentRole.BACKEND_DEVELOPER,
    system_prompt="You are a Python backend specialist focused on FastAPI.",
)
```

### Observability: Logger and Tracer

The SDK includes structured logging and execution tracing.

**Logger:**

```python
from tcs_bpi_ai_team import Logger, LoggerConfig, LogLevel, LogEntry

# Create a logger with custom config
logger = Logger(LoggerConfig(
    level=LogLevel.DEBUG,
    timestamps=True,
))

# Standard log levels
logger.debug("Processing stage", {"role": "dba", "action": "design"})
logger.info("Stage completed", {"duration_ms": 1234.5})
logger.warn("Approaching token limit", {"tokens": 3800, "max": 4096})
logger.error("Stage failed", {"error": "Connection refused"})

# Pipeline-specific convenience methods
logger.pipeline_start("Backend Feature", "TASK-001")
logger.stage_start("tech-lead", "plan", "TASK-001")
logger.stage_end("tech-lead", "plan", "TASK-001", duration_ms=2345.6)
logger.handoff("tech-lead", "backend-developer", "Implementation ready")
logger.stage_error("backend-developer", "implement", "Compilation error")
logger.pipeline_end("Backend Feature", "TASK-001", stages_completed=3)

# Retrieve all entries
entries = logger.get_entries()

# Custom handler for integration with external logging systems
def json_handler(entry: LogEntry) -> None:
    import json
    print(json.dumps({
        "level": entry.level.name,
        "event": entry.event,
        "data": entry.data,
        "ts": entry.timestamp,
    }))

custom_logger = Logger(LoggerConfig(level=LogLevel.INFO, handler=json_handler))
```

**Tracer:**

```python
from tcs_bpi_ai_team import Tracer, AgentRole

tracer = Tracer()

# Start a trace for a pipeline run
trace = tracer.start_trace("TASK-001", "Backend Feature")

# Create spans for each stage
span1 = tracer.start_span(
    trace.id,
    "Tech Lead: plan",
    role=AgentRole.TECH_LEAD,
    action="plan",
)
# ... stage executes ...
tracer.end_span(span1, status="completed")

span2 = tracer.start_span(
    trace.id,
    "Backend Developer: implement",
    role=AgentRole.BACKEND_DEVELOPER,
    action="implement",
    parent_id=span1.id,  # optional parent for nesting
)
# ... stage executes ...
tracer.end_span(span2, status="completed")

# Finish the trace
tracer.end_trace(trace.id)

# Print a human-readable summary
tracer.print_trace_summary(trace.id)

# Export as JSON for external tools
trace_json = tracer.export_trace_json(trace.id)
print(trace_json)
```

---

## Approach 3: TypeScript SDK

The TypeScript SDK provides the same orchestration capabilities for Node.js and TypeScript projects.

### TypeScript Installation

```bash
npm install @tcs-bpi/ai-team --registry=https://npm.pkg.github.com
```

You also need the Anthropic SDK as a peer dependency:

```bash
npm install @anthropic-ai/sdk
```

### TypeScript Basic Usage

```typescript
import {
  Orchestrator,
  TechLead,
  BackendDeveloper,
  QAEngineer,
} from "@tcs-bpi/ai-team";
import { TaskType, TaskStatus } from "@tcs-bpi/ai-team";
import type { Task, TaskResult, HandoffRequest } from "@tcs-bpi/ai-team";

async function main() {
  // Create orchestrator with callbacks
  const orchestrator = new Orchestrator({
    onTaskComplete: (result: TaskResult) => {
      console.log(`${result.agentRole} completed (success: ${result.success})`);
    },
    onHandoff: (handoff: HandoffRequest) => {
      console.log(
        `Handoff: ${handoff.fromRole} -> ${handoff.toRole} (${handoff.reason})`
      );
    },
    onError: (error: Error, task: Task) => {
      console.error(`Error on task "${task.title}":`, error.message);
    },
  });

  // Register agents
  orchestrator.registerAgents([
    new TechLead(),
    new BackendDeveloper(),
    new QAEngineer(),
  ]);

  // Create a task
  const task: Task = {
    id: "TASK-001",
    type: TaskType.BackendFeature,
    title: "Add user profile endpoint",
    description:
      "Create a GET /api/users/:id/profile endpoint that returns " +
      "the user's profile including name, email, and avatar URL.",
    status: TaskStatus.Created,
    priority: "medium",
  };

  // Submit and process through the pipeline
  const results = await orchestrator.submitTask(task);

  for (const result of results) {
    console.log(`--- ${result.agentRole} ---`);
    console.log(result.output.slice(0, 300));
  }
}

main().catch(console.error);
```

### YAML Pipeline Loading

The Python SDK includes a YAML pipeline loader. You can define pipelines as YAML files and load them at runtime:

```python
from tcs_bpi_ai_team import parse_pipeline_yaml, load_pipelines_from_directory

# Parse a single YAML pipeline definition
yaml_content = """
name: Database Migration
task_type: db-migration
stages:
  - role: dba
    action: design
    required: true
  - role: backend-developer
    action: integrate
    required: true
  - role: qa-engineer
    action: verify
    required: true
"""

pipeline = parse_pipeline_yaml(yaml_content)
print(pipeline.name)       # "Database Migration"
print(len(pipeline.stages))  # 3

# Load all YAML pipelines from a directory
pipelines = load_pipelines_from_directory("pipelines/")
print(f"Loaded {len(pipelines)} pipelines")
```

In TypeScript, the orchestrator accepts pipelines directly via the config:

```typescript
import { Orchestrator } from "@tcs-bpi/ai-team";
import { AgentRole, TaskType } from "@tcs-bpi/ai-team";
import type { Pipeline } from "@tcs-bpi/ai-team";

const customPipeline: Pipeline = {
  name: "Custom DB Pipeline",
  taskType: TaskType.DBMigration,
  stages: [
    { role: AgentRole.DBA, action: "design", required: true },
    { role: AgentRole.BackendDeveloper, action: "implement", required: true },
    { role: AgentRole.SecurityAnalyst, action: "review", required: true },
    { role: AgentRole.QAEngineer, action: "verify", required: true },
  ],
};

const orchestrator = new Orchestrator({
  pipelines: [customPipeline],
});
```

### Logging and Tracing

The Python SDK provides dedicated Logger and Tracer classes (see the [Observability section](#observability-logger-and-tracer) above). In TypeScript, you can implement equivalent functionality using the orchestrator callbacks:

```typescript
import { Orchestrator } from "@tcs-bpi/ai-team";
import type { TaskResult, HandoffRequest, Task } from "@tcs-bpi/ai-team";

const orchestrator = new Orchestrator({
  onTaskComplete: (result: TaskResult) => {
    console.log(JSON.stringify({
      event: "stage.complete",
      role: result.agentRole,
      success: result.success,
      timestamp: new Date().toISOString(),
    }));
  },
  onHandoff: (handoff: HandoffRequest) => {
    console.log(JSON.stringify({
      event: "handoff",
      from: handoff.fromRole,
      to: handoff.toRole,
      reason: handoff.reason,
    }));
  },
  onError: (error: Error, task: Task) => {
    console.error(JSON.stringify({
      event: "stage.error",
      task: task.id,
      error: error.message,
    }));
  },
});
```

### Context Summarization

The Python SDK includes a context summarizer that compresses older context entries to prevent token overflow in long pipelines:

```python
from tcs_bpi_ai_team import (
    summarize_context,
    estimate_context_tokens,
    SummarizerConfig,
    SharedContext,
    ContextEntry,
    AgentRole,
)

# Build a context with many entries
context = SharedContext(task_id="TASK-001")
for i in range(10):
    context.history.append(ContextEntry(
        role=AgentRole.BACKEND_DEVELOPER,
        action=f"Step {i}",
        summary=f"Detailed output from step {i} " * 50,
        timestamp=f"2025-01-01T0{i}:00:00Z",
    ))

# Check estimated token count
tokens = estimate_context_tokens(context)
print(f"Estimated tokens: {tokens}")

# Summarize to reduce token usage
config = SummarizerConfig(
    max_full_entries=3,       # keep 3 most recent entries in full
    max_summary_length=200,   # truncate older entries to 200 chars
    trigger_threshold=5,      # only summarize when > 5 entries
)
summarized = summarize_context(context, config)
print(f"Entries after summarization: {len(summarized.history)}")
print(f"Tokens after: {estimate_context_tokens(summarized)}")
```

---

## Custom Pipelines

### Defining Pipelines in Code

**Python:**

```python
from tcs_bpi_ai_team import (
    Orchestrator,
    OrchestratorConfig,
    Pipeline,
    PipelineStage,
    AgentRole,
    TaskType,
    DBA,
    SecurityAnalyst,
    QAEngineer,
    BackendDeveloper,
)

# Define a custom pipeline
secure_migration = Pipeline(
    name="Secure Database Migration",
    task_type=TaskType.DB_MIGRATION,
    stages=[
        PipelineStage(role=AgentRole.DBA, action="design", required=True),
        PipelineStage(role=AgentRole.SECURITY_ANALYST, action="review", required=True),
        PipelineStage(role=AgentRole.BACKEND_DEVELOPER, action="integrate", required=True),
        PipelineStage(role=AgentRole.QA_ENGINEER, action="verify", required=True),
    ],
)

# Use it in an orchestrator
config = OrchestratorConfig(pipelines=[secure_migration])
orchestrator = Orchestrator(config)
orchestrator.register_agents([DBA(), SecurityAnalyst(), BackendDeveloper(), QAEngineer()])
```

**TypeScript:**

```typescript
import {
  Orchestrator,
  DBA,
  SecurityAnalyst,
  BackendDeveloper,
  QAEngineer,
} from "@tcs-bpi/ai-team";
import { AgentRole, TaskType } from "@tcs-bpi/ai-team";

const secureMigration = {
  name: "Secure Database Migration",
  taskType: TaskType.DBMigration,
  stages: [
    { role: AgentRole.DBA, action: "design", required: true },
    { role: AgentRole.SecurityAnalyst, action: "review", required: true },
    { role: AgentRole.BackendDeveloper, action: "integrate", required: true },
    { role: AgentRole.QAEngineer, action: "verify", required: true },
  ],
};

const orchestrator = new Orchestrator({ pipelines: [secureMigration] });
orchestrator.registerAgents([
  new DBA(),
  new SecurityAnalyst(),
  new BackendDeveloper(),
  new QAEngineer(),
]);
```

### Defining Pipelines in YAML

Create a `.yml` file in the `pipelines/` directory:

```yaml
# pipelines/secure-db-migration.yml
name: Secure Database Migration
task_type: db-migration
stages:
  - role: dba
    action: design
    required: true
  - role: security-analyst
    action: review
    required: true
  - role: backend-developer
    action: integrate
    required: true
  - role: qa-engineer
    action: verify
    required: true
```

Load and use it in Python:

```python
from tcs_bpi_ai_team import load_pipelines_from_directory, Orchestrator, OrchestratorConfig

pipelines = load_pipelines_from_directory("pipelines/")
config = OrchestratorConfig(pipelines=pipelines)
orchestrator = Orchestrator(config)
```

---

## Built-in Pipelines

The library ships with 10 built-in pipelines that are used by default when no custom pipelines are configured:

| Pipeline | Task Type Slug | Stages |
|----------|---------------|--------|
| Backend Feature | `backend-feature` | Tech Lead (plan) -> Backend Developer (implement) -> QA Engineer (test) |
| Frontend Feature | `frontend-feature` | Tech Lead (plan) -> Frontend Developer (implement) -> QA Engineer (test) |
| Bug Fix | `bug-fix` | QA Engineer (reproduce) -> Backend Developer (fix) -> QA Engineer (verify) |
| Database Migration | `db-migration` | DBA (design) -> Backend Developer (integrate) -> QA Engineer (verify) |
| Security Review | `security-review` | Security Analyst (audit) -> Backend Developer (fix*) -> Security Analyst (verify) |
| Documentation | `documentation` | Technical Writer (write) -> Tech Lead (review*) |
| Infrastructure | `infrastructure` | DevOps Engineer (implement) -> Security Analyst (review*) |
| Testing | `testing` | QA Engineer (write-tests) |
| Code Review | `code-review` | Tech Lead (review) -> Security Analyst (security-check*) |
| Sprint Planning | `sprint-planning` | Project Manager (plan) -> Tech Lead (estimate) |

Stages marked with * are optional (`required: false`) -- the pipeline continues if the agent for that role is not registered.

---

## Advanced Features

### Parallel Execution

The Python SDK supports running multiple pipeline stages concurrently when they are independent:

```python
import asyncio

from tcs_bpi_ai_team import (
    ParallelGroup,
    execute_parallel_group,
    identify_parallel_groups,
    is_parallel_group,
    PipelineStage,
    AgentRole,
    SharedContext,
    Task,
    TaskStatus,
    TaskType,
    SecurityAnalyst,
    QAEngineer,
)

# Define stages -- mark independent stages with a parallel attribute
stages = [
    PipelineStage(role=AgentRole.SECURITY_ANALYST, action="audit", required=True),
    PipelineStage(role=AgentRole.QA_ENGINEER, action="test", required=True),
]

# Mark them as parallel (add the attribute dynamically)
for stage in stages:
    stage.parallel = True  # type: ignore[attr-defined]

# Identify groups of parallelizable stages
groups = identify_parallel_groups(stages)

# Execute a parallel group
agents = {
    AgentRole.SECURITY_ANALYST: SecurityAnalyst(),
    AgentRole.QA_ENGINEER: QAEngineer(),
}

task = Task(
    id="TASK-001",
    type=TaskType.SECURITY_REVIEW,
    title="Parallel audit and test",
    description="Run security audit and tests concurrently.",
    status=TaskStatus.CREATED,
    priority="medium",
)

context = SharedContext(task_id=task.id)


async def run_parallel() -> None:
    for group_or_stage in groups:
        if is_parallel_group(group_or_stage):
            results = await execute_parallel_group(
                group_or_stage, agents, task, context  # type: ignore[arg-type]
            )
            for r in results:
                print(f"{r.agent_role}: {r.success}")
        else:
            # Run sequential stage normally
            agent = agents[group_or_stage.role]
            result = await agent.execute(task, context)
            print(f"{result.agent_role}: {result.success}")


asyncio.run(run_parallel())
```

### Context Summarization (Advanced)

For long-running pipelines with many stages, context can grow large enough to exceed token limits. The summarizer compresses older entries while keeping recent ones intact:

```python
from tcs_bpi_ai_team import summarize_context, SummarizerConfig, SharedContext

# Configure summarization behavior
config = SummarizerConfig(
    max_full_entries=3,       # number of recent entries to keep verbatim
    max_summary_length=200,   # max characters for older entry summaries
    trigger_threshold=5,      # only trigger when history exceeds this count
)

# Apply between pipeline stages
context = SharedContext(task_id="TASK-001")
# ... after several stages have appended to context.history ...
context = summarize_context(context, config)
```

The summarizer:
- Keeps the N most recent entries at full length
- Truncates older entries to `max_summary_length` characters
- Prefixes compressed entries with `[Summarized]` in the action field
- Only activates when the history length exceeds `trigger_threshold`

### YAML Pipeline Loading (Advanced)

Load all pipeline definitions from a directory at once:

```python
from tcs_bpi_ai_team import load_pipelines_from_directory, Orchestrator, OrchestratorConfig

# Load every .yml and .yaml file from the directory
pipelines = load_pipelines_from_directory("pipelines/")

# Merge with or replace default pipelines
config = OrchestratorConfig(pipelines=pipelines)
orchestrator = Orchestrator(config)

# Verify loaded pipelines
for p in pipelines:
    stages_str = " -> ".join(f"{s.role}({s.action})" for s in p.stages)
    print(f"{p.name}: {stages_str}")
```

YAML pipeline format:

```yaml
name: <Human-readable name>
task_type: <task-type-slug>
stages:
  - role: <agent-role-slug>
    action: <action-name>
    required: true
  - role: <agent-role-slug>
    action: <action-name>
    required: false
```

Valid `task_type` values: `backend-feature`, `frontend-feature`, `bug-fix`, `db-migration`, `security-review`, `documentation`, `infrastructure`, `testing`, `code-review`, `sprint-planning`.

Valid `role` values: `project-manager`, `tech-lead`, `backend-developer`, `frontend-developer`, `qa-engineer`, `devops-engineer`, `dba`, `security-analyst`, `technical-writer`.

---

## Troubleshooting

### "No pipeline defined for task type: X"

The task type you provided does not match any registered pipeline. Check that:
- You are using a valid `TaskType` enum value
- If using custom pipelines, verify that your pipeline list includes a pipeline with the matching `task_type`
- If you passed `pipelines=[]` to `OrchestratorConfig`, no pipelines are available (the defaults are replaced, not merged)

### "Required agent role X is not registered"

A pipeline stage marked as `required: true` needs an agent of that role, but none was registered. Fix by registering the missing agent:

```python
orchestrator.register_agent(DBA())
```

### "ANTHROPIC_API_KEY not set"

The Python and TypeScript SDKs require the `ANTHROPIC_API_KEY` environment variable. Set it before running:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Claude Code does not require this -- it uses its own authentication.

### "No agent class registered for role: X"

You passed an invalid string to `create_agent`. Use the `AgentRole` enum:

```python
from tcs_bpi_ai_team import create_agent, AgentRole
agent = create_agent(AgentRole.DBA)  # correct
```

### Pipeline stages are skipped silently

Stages with `required: false` are skipped when the corresponding agent is not registered. This is by design. If you want all stages to execute, either:
- Register all agents needed by the pipeline
- Change the stage to `required: true`

### Context token overflow

If you are seeing truncated or degraded responses in later pipeline stages, enable context summarization:

```python
from tcs_bpi_ai_team import summarize_context, SummarizerConfig

context = summarize_context(context, SummarizerConfig(
    max_full_entries=2,
    max_summary_length=150,
    trigger_threshold=4,
))
```

### YAML pipeline loading fails

Ensure your YAML file has all three required top-level fields: `name`, `task_type`, and `stages`. Each stage must have `role` and `action`. The YAML parser is minimal and only supports the pipeline schema -- nested objects and complex YAML features are not supported.
