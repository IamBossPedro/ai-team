# Quick Start

Get running with `@tcs-bpi/ai-team` in under 5 minutes. Pick the approach that fits your workflow.

---

## Option A: Claude Code (Fastest -- No API Key Required)

Claude Code is the fastest way to start. No installation or API key needed.

### 1. Add the ai-team submodule to your project

```bash
git submodule add https://github.com/TCS-BPI/ai-team.git lib/ai-team
```

### 2. Copy skills into your project

```bash
mkdir -p .claude/skills
cp -r lib/ai-team/claude-code/skills/* .claude/skills/
```

### 3. Use roles and skills in Claude Code

Open a Claude Code session in your project directory and start using roles:

```
"As the DBA, review the database schema in this project."

"As the Tech Lead, plan the implementation of a search feature."

"Run a security audit on the src/ directory."

"Review the code changes in my current branch."
```

Available skills: code-review, security-audit, db-migration, write-docs, plan-sprint, run-tests.

---

## Option B: Python SDK

### 1. Install

```bash
pip install tcs-bpi-ai-team
```

### 2. Set your API key

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Run your first pipeline

Create a file called `quickstart.py`:

```python
import asyncio

from tcs_bpi_ai_team import (
    Orchestrator,
    Task,
    TaskStatus,
    TaskType,
    TechLead,
    BackendDeveloper,
    QAEngineer,
)


async def main() -> None:
    orchestrator = Orchestrator()
    orchestrator.register_agents([TechLead(), BackendDeveloper(), QAEngineer()])

    task = Task(
        id="TASK-001",
        type=TaskType.BACKEND_FEATURE,
        title="Add health check endpoint",
        description="Create a GET /api/health endpoint that returns 200 OK.",
        status=TaskStatus.CREATED,
        priority="low",
    )

    results = await orchestrator.submit_task(task)

    for result in results:
        print(f"[{result.agent_role}] success={result.success}")
        print(result.output[:200])
        print()


asyncio.run(main())
```

Run it:

```bash
python quickstart.py
```

The task flows through: Tech Lead (plan) -> Backend Developer (implement) -> QA Engineer (test).

---

## Option C: TypeScript SDK

### 1. Install

```bash
npm install @tcs-bpi/ai-team --registry=https://npm.pkg.github.com
npm install @anthropic-ai/sdk
```

### 2. Set your API key

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Run your first pipeline

Create a file called `quickstart.ts`:

```typescript
import {
  Orchestrator,
  TechLead,
  BackendDeveloper,
  QAEngineer,
} from "@tcs-bpi/ai-team";
import { TaskType, TaskStatus } from "@tcs-bpi/ai-team";

async function main() {
  const orchestrator = new Orchestrator();
  orchestrator.registerAgents([
    new TechLead(),
    new BackendDeveloper(),
    new QAEngineer(),
  ]);

  const task = {
    id: "TASK-001",
    type: TaskType.BackendFeature,
    title: "Add health check endpoint",
    description: "Create a GET /api/health endpoint that returns 200 OK.",
    status: TaskStatus.Created,
    priority: "low" as const,
  };

  const results = await orchestrator.submitTask(task);

  for (const result of results) {
    console.log(`[${result.agentRole}] success=${result.success}`);
    console.log(result.output.slice(0, 200));
    console.log();
  }
}

main().catch(console.error);
```

Run it:

```bash
npx tsx quickstart.ts
```

---

## Available Roles

| Role | Slug | Python Class | TypeScript Class |
|------|------|-------------|-----------------|
| Project Manager | `project-manager` | `ProjectManager` | `ProjectManager` |
| Tech Lead | `tech-lead` | `TechLead` | `TechLead` |
| Frontend Developer | `frontend-developer` | `FrontendDeveloper` | `FrontendDeveloper` |
| Backend Developer | `backend-developer` | `BackendDeveloper` | `BackendDeveloper` |
| DBA | `dba` | `DBA` | `DBA` |
| DevOps Engineer | `devops-engineer` | `DevOpsEngineer` | `DevOpsEngineer` |
| QA Engineer | `qa-engineer` | `QAEngineer` | `QAEngineer` |
| Security Analyst | `security-analyst` | `SecurityAnalyst` | `SecurityAnalyst` |
| Technical Writer | `technical-writer` | `TechnicalWriter` | `TechnicalWriter` |

All role classes can be imported directly:

```python
# Python
from tcs_bpi_ai_team import DBA, TechLead, QAEngineer
```

```typescript
// TypeScript
import { DBA, TechLead, QAEngineer } from "@tcs-bpi/ai-team";
```

Or created via the factory function (Python only):

```python
from tcs_bpi_ai_team import create_agent, AgentRole
dba = create_agent(AgentRole.DBA)
```

---

## Next Steps

For full details on all features including custom pipelines, YAML pipeline definitions, parallel execution, context summarization, logging, and tracing, see the [Usage Guide](./usage-guide.md).
