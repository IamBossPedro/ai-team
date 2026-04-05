"""
Basic Orchestration Example (Python)

Demonstrates routing a backend feature task through
Tech Lead (plan) → Backend Developer (implement) → QA Engineer (test)

Usage:
    export ANTHROPIC_API_KEY=your-key
    python main.py
"""

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
    print("🤖 TCS-BPI AI Team — Basic Orchestration Example (Python)\n")

    # Create the orchestrator with callbacks
    def on_complete(result: TaskResult) -> None:
        print(f"  ✅ {result.agent_role} completed (success: {result.success})")

    def on_handoff(handoff: HandoffRequest) -> None:
        print(f"  🔄 Handoff: {handoff.from_role} → {handoff.to_role} ({handoff.reason})")

    def on_error(error: Exception, task: Task) -> None:
        print(f'  ❌ Error on task "{task.title}": {error}')

    config = OrchestratorConfig(
        on_task_complete=on_complete,
        on_handoff=on_handoff,
        on_error=on_error,
    )
    orchestrator = Orchestrator(config)

    # Register agents
    tech_lead = TechLead()
    backend_dev = BackendDeveloper()
    qa_engineer = QAEngineer()

    orchestrator.register_agents([tech_lead, backend_dev, qa_engineer])

    print("Registered agents:", orchestrator.get_registered_roles())
    print()

    # Create a task
    task = Task(
        id="TASK-001",
        type=TaskType.BACKEND_FEATURE,
        title="Add user profile endpoint",
        description=(
            "Create a GET /api/users/:id/profile endpoint that returns the user's "
            "profile information including name, email, avatar URL, and account creation date. "
            "The endpoint should return 404 if the user is not found."
        ),
        status=TaskStatus.CREATED,
        priority="medium",
    )

    print(f'📋 Submitting task: "{task.title}" ({task.type})\n')
    print("Pipeline: Tech Lead (plan) → Backend Developer (implement) → QA Engineer (test)\n")

    # Submit task through the pipeline
    results = await orchestrator.submit_task(task)

    print(f"\n📊 Results: {len(results)} stage(s) completed\n")

    for result in results:
        print(f"--- {result.agent_role} ---")
        print(result.output[:300])
        print("...\n")

    print(f"Final task status: {task.status}")


if __name__ == "__main__":
    asyncio.run(main())
