"""Tests for core type definitions."""

from tcs_bpi_ai_team.types import (
    AgentConfig,
    AgentRole,
    ContextEntry,
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


class TestAgentRole:
    def test_all_roles_exist(self) -> None:
        assert len(AgentRole) == 9

    def test_role_values(self) -> None:
        assert AgentRole.PROJECT_MANAGER == "project-manager"
        assert AgentRole.TECH_LEAD == "tech-lead"
        assert AgentRole.BACKEND_DEVELOPER == "backend-developer"
        assert AgentRole.FRONTEND_DEVELOPER == "frontend-developer"
        assert AgentRole.QA_ENGINEER == "qa-engineer"
        assert AgentRole.DEVOPS_ENGINEER == "devops-engineer"
        assert AgentRole.DBA == "dba"
        assert AgentRole.SECURITY_ANALYST == "security-analyst"
        assert AgentRole.TECHNICAL_WRITER == "technical-writer"

    def test_role_is_string(self) -> None:
        assert isinstance(AgentRole.BACKEND_DEVELOPER, str)
        assert str(AgentRole.BACKEND_DEVELOPER) == "backend-developer"


class TestTaskStatus:
    def test_all_statuses_exist(self) -> None:
        assert len(TaskStatus) == 6

    def test_status_values(self) -> None:
        assert TaskStatus.CREATED == "created"
        assert TaskStatus.IN_PROGRESS == "in_progress"
        assert TaskStatus.COMPLETED == "completed"
        assert TaskStatus.FAILED == "failed"


class TestTaskType:
    def test_all_types_exist(self) -> None:
        assert len(TaskType) == 10

    def test_type_values(self) -> None:
        assert TaskType.BACKEND_FEATURE == "backend-feature"
        assert TaskType.BUG_FIX == "bug-fix"
        assert TaskType.DB_MIGRATION == "db-migration"
        assert TaskType.SECURITY_REVIEW == "security-review"


class TestTask:
    def test_create_task(self) -> None:
        task = Task(
            id="TASK-001",
            type=TaskType.BACKEND_FEATURE,
            title="Add user endpoint",
            description="Create a GET /api/users endpoint",
            status=TaskStatus.CREATED,
            priority="medium",
        )
        assert task.id == "TASK-001"
        assert task.type == TaskType.BACKEND_FEATURE
        assert task.status == TaskStatus.CREATED
        assert task.assigned_to is None
        assert task.metadata is None

    def test_task_with_optional_fields(self) -> None:
        task = Task(
            id="TASK-002",
            type=TaskType.BUG_FIX,
            title="Fix login bug",
            description="Users cannot log in",
            status=TaskStatus.ASSIGNED,
            priority="critical",
            assigned_to=AgentRole.BACKEND_DEVELOPER,
            created_by=AgentRole.PROJECT_MANAGER,
            metadata={"sprint": 5},
        )
        assert task.assigned_to == AgentRole.BACKEND_DEVELOPER
        assert task.created_by == AgentRole.PROJECT_MANAGER
        assert task.metadata == {"sprint": 5}


class TestTaskResult:
    def test_create_result(self) -> None:
        result = TaskResult(
            task_id="TASK-001",
            agent_role=AgentRole.BACKEND_DEVELOPER,
            success=True,
            output="Implemented the endpoint.",
        )
        assert result.success is True
        assert result.handoff_request is None


class TestHandoffRequest:
    def test_create_handoff(self) -> None:
        handoff = HandoffRequest(
            from_role=AgentRole.BACKEND_DEVELOPER,
            to_role=AgentRole.QA_ENGINEER,
            reason="Ready for testing",
            context="Endpoint implemented at /api/users",
            task_id="TASK-001",
        )
        assert handoff.from_role == AgentRole.BACKEND_DEVELOPER
        assert handoff.to_role == AgentRole.QA_ENGINEER


class TestSharedContext:
    def test_create_empty_context(self) -> None:
        ctx = SharedContext(task_id="TASK-001")
        assert ctx.history == []
        assert ctx.files == {}
        assert ctx.metadata == {}

    def test_add_to_context(self) -> None:
        ctx = SharedContext(task_id="TASK-001")
        entry = ContextEntry(
            role=AgentRole.TECH_LEAD,
            action="Planned architecture",
            summary="Use REST with Express",
            timestamp="2025-01-01T00:00:00Z",
        )
        ctx.history.append(entry)
        assert len(ctx.history) == 1
        assert ctx.history[0].role == AgentRole.TECH_LEAD


class TestPipeline:
    def test_create_pipeline(self) -> None:
        pipeline = Pipeline(
            name="Backend Feature",
            task_type=TaskType.BACKEND_FEATURE,
            stages=[
                PipelineStage(role=AgentRole.TECH_LEAD, action="plan"),
                PipelineStage(role=AgentRole.BACKEND_DEVELOPER, action="implement"),
                PipelineStage(role=AgentRole.QA_ENGINEER, action="test"),
            ],
        )
        assert len(pipeline.stages) == 3
        assert pipeline.stages[0].required is True  # default


class TestAgentConfig:
    def test_defaults(self) -> None:
        config = AgentConfig(role=AgentRole.BACKEND_DEVELOPER)
        assert config.model is None
        assert config.max_tokens is None
        assert config.temperature is None

    def test_custom_config(self) -> None:
        config = AgentConfig(
            role=AgentRole.TECH_LEAD,
            model="claude-opus-4-20250514",
            max_tokens=8192,
            temperature=0.5,
        )
        assert config.model == "claude-opus-4-20250514"
        assert config.max_tokens == 8192
