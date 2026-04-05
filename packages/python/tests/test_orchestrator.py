"""Tests for the Orchestrator."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from tcs_bpi_ai_team.orchestrator import DEFAULT_PIPELINES, Orchestrator
from tcs_bpi_ai_team.types import (
    AgentConfig,
    AgentRole,
    HandoffRequest,
    OrchestratorConfig,
    Pipeline,
    PipelineStage,
    SharedContext,
    Task,
    TaskResult,
    TaskStatus,
    TaskType,
)
from tcs_bpi_ai_team.agent import Agent


class MockAgent(Agent):
    """Mock agent for testing."""

    def __init__(self, role: AgentRole, output: str = "Done.", success: bool = True) -> None:
        super().__init__(AgentConfig(role=role, system_prompt="mock"))
        self._output = output
        self._success = success

    def can_handle(self, task_type: TaskType) -> bool:
        return True

    async def execute(self, task: Task, context: SharedContext) -> TaskResult:
        return TaskResult(
            task_id=task.id,
            agent_role=self.role,
            success=self._success,
            output=self._output,
        )


def make_task(**overrides: object) -> Task:
    defaults = dict(
        id="TASK-001",
        type=TaskType.BACKEND_FEATURE,
        title="Test task",
        description="A test task",
        status=TaskStatus.CREATED,
        priority="medium",
    )
    defaults.update(overrides)
    return Task(**defaults)  # type: ignore[arg-type]


class TestOrchestratorRegistration:
    def test_register_agent(self) -> None:
        orch = Orchestrator()
        agent = MockAgent(AgentRole.BACKEND_DEVELOPER)
        orch.register_agent(agent)
        assert AgentRole.BACKEND_DEVELOPER in orch.get_registered_roles()

    def test_register_agents(self) -> None:
        orch = Orchestrator()
        agents = [
            MockAgent(AgentRole.TECH_LEAD),
            MockAgent(AgentRole.BACKEND_DEVELOPER),
            MockAgent(AgentRole.QA_ENGINEER),
        ]
        orch.register_agents(agents)
        roles = orch.get_registered_roles()
        assert len(roles) == 3
        assert AgentRole.TECH_LEAD in roles
        assert AgentRole.BACKEND_DEVELOPER in roles
        assert AgentRole.QA_ENGINEER in roles


class TestOrchestratorPipelines:
    def test_default_pipelines_loaded(self) -> None:
        orch = Orchestrator()
        assert len(DEFAULT_PIPELINES) == 10

    def test_get_pipeline(self) -> None:
        orch = Orchestrator()
        pipeline = orch.get_pipeline(TaskType.BACKEND_FEATURE)
        assert pipeline is not None
        assert pipeline.name == "Backend Feature"
        assert len(pipeline.stages) == 3

    def test_get_pipeline_not_found(self) -> None:
        orch = Orchestrator(OrchestratorConfig(pipelines=[]))
        pipeline = orch.get_pipeline(TaskType.BACKEND_FEATURE)
        assert pipeline is None

    def test_custom_pipelines(self) -> None:
        custom = [
            Pipeline(
                name="Custom",
                task_type=TaskType.BACKEND_FEATURE,
                stages=[
                    PipelineStage(role=AgentRole.BACKEND_DEVELOPER, action="do-it"),
                ],
            ),
        ]
        orch = Orchestrator(OrchestratorConfig(pipelines=custom))
        pipeline = orch.get_pipeline(TaskType.BACKEND_FEATURE)
        assert pipeline is not None
        assert pipeline.name == "Custom"
        assert len(pipeline.stages) == 1


class TestOrchestratorSubmitTask:
    @pytest.mark.asyncio
    async def test_submit_task_success(self) -> None:
        orch = Orchestrator()
        orch.register_agents([
            MockAgent(AgentRole.TECH_LEAD, "Architecture plan"),
            MockAgent(AgentRole.BACKEND_DEVELOPER, "Implementation done"),
            MockAgent(AgentRole.QA_ENGINEER, "Tests passed"),
        ])

        task = make_task()
        results = await orch.submit_task(task)

        assert len(results) == 3
        assert results[0].agent_role == AgentRole.TECH_LEAD
        assert results[1].agent_role == AgentRole.BACKEND_DEVELOPER
        assert results[2].agent_role == AgentRole.QA_ENGINEER
        assert task.status == TaskStatus.COMPLETED

    @pytest.mark.asyncio
    async def test_submit_task_no_pipeline(self) -> None:
        orch = Orchestrator(OrchestratorConfig(pipelines=[]))
        task = make_task()

        with pytest.raises(ValueError, match="No pipeline defined"):
            await orch.submit_task(task)

    @pytest.mark.asyncio
    async def test_submit_task_missing_required_agent(self) -> None:
        orch = Orchestrator()
        # Only register tech lead, missing backend and qa
        orch.register_agent(MockAgent(AgentRole.TECH_LEAD))

        task = make_task()
        with pytest.raises(ValueError, match="Required agent role"):
            await orch.submit_task(task)

    @pytest.mark.asyncio
    async def test_submit_task_skips_optional_stages(self) -> None:
        custom = [
            Pipeline(
                name="Test",
                task_type=TaskType.BACKEND_FEATURE,
                stages=[
                    PipelineStage(role=AgentRole.BACKEND_DEVELOPER, action="do", required=True),
                    PipelineStage(role=AgentRole.SECURITY_ANALYST, action="review", required=False),
                ],
            ),
        ]
        orch = Orchestrator(OrchestratorConfig(pipelines=custom))
        orch.register_agent(MockAgent(AgentRole.BACKEND_DEVELOPER))
        # Security analyst NOT registered — should be skipped

        task = make_task()
        results = await orch.submit_task(task)

        assert len(results) == 1
        assert results[0].agent_role == AgentRole.BACKEND_DEVELOPER
        assert task.status == TaskStatus.COMPLETED

    @pytest.mark.asyncio
    async def test_submit_task_failure_stops_pipeline(self) -> None:
        custom = [
            Pipeline(
                name="Test",
                task_type=TaskType.BACKEND_FEATURE,
                stages=[
                    PipelineStage(role=AgentRole.BACKEND_DEVELOPER, action="do", required=True),
                    PipelineStage(role=AgentRole.QA_ENGINEER, action="test", required=True),
                ],
            ),
        ]
        orch = Orchestrator(OrchestratorConfig(pipelines=custom))
        orch.register_agents([
            MockAgent(AgentRole.BACKEND_DEVELOPER, "Failed", success=False),
            MockAgent(AgentRole.QA_ENGINEER, "Tests"),
        ])

        task = make_task()
        results = await orch.submit_task(task)

        assert len(results) == 1  # Stopped after first failure
        assert task.status == TaskStatus.FAILED


class TestOrchestratorCallbacks:
    @pytest.mark.asyncio
    async def test_on_task_complete_callback(self) -> None:
        completed: list[TaskResult] = []
        config = OrchestratorConfig(
            on_task_complete=lambda r: completed.append(r),
            pipelines=[
                Pipeline(
                    name="Test",
                    task_type=TaskType.BACKEND_FEATURE,
                    stages=[
                        PipelineStage(role=AgentRole.BACKEND_DEVELOPER, action="do"),
                    ],
                ),
            ],
        )
        orch = Orchestrator(config)
        orch.register_agent(MockAgent(AgentRole.BACKEND_DEVELOPER))

        task = make_task()
        await orch.submit_task(task)

        assert len(completed) == 1
        assert completed[0].agent_role == AgentRole.BACKEND_DEVELOPER

    @pytest.mark.asyncio
    async def test_on_error_callback(self) -> None:
        errors: list[tuple[Exception, Task]] = []

        class FailAgent(Agent):
            def can_handle(self, task_type: TaskType) -> bool:
                return True
            async def execute(self, task: Task, context: SharedContext) -> TaskResult:
                raise RuntimeError("API error")

        config = OrchestratorConfig(
            on_error=lambda e, t: errors.append((e, t)),
            pipelines=[
                Pipeline(
                    name="Test",
                    task_type=TaskType.BACKEND_FEATURE,
                    stages=[
                        PipelineStage(role=AgentRole.BACKEND_DEVELOPER, action="do"),
                    ],
                ),
            ],
        )
        orch = Orchestrator(config)
        orch.register_agent(FailAgent(AgentConfig(role=AgentRole.BACKEND_DEVELOPER, system_prompt="mock")))

        task = make_task()
        with pytest.raises(RuntimeError, match="API error"):
            await orch.submit_task(task)

        assert len(errors) == 1
        assert str(errors[0][0]) == "API error"
