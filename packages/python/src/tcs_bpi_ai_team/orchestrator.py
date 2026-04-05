"""Orchestrator — deterministic task routing through agent pipelines."""

from __future__ import annotations

from tcs_bpi_ai_team.agent import Agent
from tcs_bpi_ai_team.types import (
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

R = AgentRole
T = TaskType

DEFAULT_PIPELINES: list[Pipeline] = [
    Pipeline(
        name="Backend Feature",
        task_type=T.BACKEND_FEATURE,
        stages=[
            PipelineStage(role=R.TECH_LEAD, action="plan", required=True),
            PipelineStage(role=R.BACKEND_DEVELOPER, action="implement", required=True),
            PipelineStage(role=R.QA_ENGINEER, action="test", required=True),
        ],
    ),
    Pipeline(
        name="Frontend Feature",
        task_type=T.FRONTEND_FEATURE,
        stages=[
            PipelineStage(role=R.TECH_LEAD, action="plan", required=True),
            PipelineStage(role=R.FRONTEND_DEVELOPER, action="implement", required=True),
            PipelineStage(role=R.QA_ENGINEER, action="test", required=True),
        ],
    ),
    Pipeline(
        name="Bug Fix",
        task_type=T.BUG_FIX,
        stages=[
            PipelineStage(role=R.QA_ENGINEER, action="reproduce", required=True),
            PipelineStage(role=R.BACKEND_DEVELOPER, action="fix", required=True),
            PipelineStage(role=R.QA_ENGINEER, action="verify", required=True),
        ],
    ),
    Pipeline(
        name="Database Migration",
        task_type=T.DB_MIGRATION,
        stages=[
            PipelineStage(role=R.DBA, action="design", required=True),
            PipelineStage(role=R.BACKEND_DEVELOPER, action="integrate", required=True),
            PipelineStage(role=R.QA_ENGINEER, action="verify", required=True),
        ],
    ),
    Pipeline(
        name="Security Review",
        task_type=T.SECURITY_REVIEW,
        stages=[
            PipelineStage(role=R.SECURITY_ANALYST, action="audit", required=True),
            PipelineStage(role=R.BACKEND_DEVELOPER, action="fix", required=False),
            PipelineStage(role=R.SECURITY_ANALYST, action="verify", required=True),
        ],
    ),
    Pipeline(
        name="Documentation",
        task_type=T.DOCUMENTATION,
        stages=[
            PipelineStage(role=R.TECHNICAL_WRITER, action="write", required=True),
            PipelineStage(role=R.TECH_LEAD, action="review", required=False),
        ],
    ),
    Pipeline(
        name="Infrastructure",
        task_type=T.INFRASTRUCTURE,
        stages=[
            PipelineStage(role=R.DEVOPS_ENGINEER, action="implement", required=True),
            PipelineStage(role=R.SECURITY_ANALYST, action="review", required=False),
        ],
    ),
    Pipeline(
        name="Testing",
        task_type=T.TESTING,
        stages=[
            PipelineStage(role=R.QA_ENGINEER, action="write-tests", required=True),
        ],
    ),
    Pipeline(
        name="Code Review",
        task_type=T.CODE_REVIEW,
        stages=[
            PipelineStage(role=R.TECH_LEAD, action="review", required=True),
            PipelineStage(role=R.SECURITY_ANALYST, action="security-check", required=False),
        ],
    ),
    Pipeline(
        name="Sprint Planning",
        task_type=T.SPRINT_PLANNING,
        stages=[
            PipelineStage(role=R.PROJECT_MANAGER, action="plan", required=True),
            PipelineStage(role=R.TECH_LEAD, action="estimate", required=True),
        ],
    ),
]


class Orchestrator:
    """Deterministic task orchestrator that routes tasks through agent pipelines."""

    def __init__(self, config: OrchestratorConfig | None = None) -> None:
        self.config = config or OrchestratorConfig()
        self._agents: dict[AgentRole, Agent] = {}
        self._pipelines = (
            list(DEFAULT_PIPELINES)
            if self.config.pipelines is None
            else self.config.pipelines
        )

    def register_agent(self, agent: Agent) -> None:
        """Register an agent with the orchestrator."""
        self._agents[agent.role] = agent

    def register_agents(self, agents: list[Agent]) -> None:
        """Register multiple agents at once."""
        for agent in agents:
            self.register_agent(agent)

    def get_registered_roles(self) -> list[AgentRole]:
        """Get all registered agent roles."""
        return list(self._agents.keys())

    def get_pipeline(self, task_type: TaskType) -> Pipeline | None:
        """Get the pipeline for a given task type."""
        for pipeline in self._pipelines:
            if pipeline.task_type == task_type:
                return pipeline
        return None

    async def submit_task(self, task: Task) -> list[TaskResult]:
        """Submit a task for processing through its pipeline.

        Returns results from each stage in order.
        """
        pipeline = self.get_pipeline(task.type)
        if pipeline is None:
            msg = f"No pipeline defined for task type: {task.type}"
            raise ValueError(msg)

        context = SharedContext(task_id=task.id)
        results: list[TaskResult] = []

        for stage in pipeline.stages:
            agent = self._agents.get(stage.role)

            if agent is None:
                if stage.required:
                    msg = (
                        f'Required agent role "{stage.role}" is not registered. '
                        f'Pipeline "{pipeline.name}" cannot proceed.'
                    )
                    raise ValueError(msg)
                continue

            task.status = TaskStatus.IN_PROGRESS
            task.assigned_to = stage.role

            try:
                result = await agent.execute(task, context)
                results.append(result)

                if self.config.on_task_complete:
                    self.config.on_task_complete(result)

                if result.handoff_request:
                    if self.config.on_handoff:
                        self.config.on_handoff(result.handoff_request)
                    handoff_result = await self._handle_handoff(
                        result.handoff_request, task, context
                    )
                    if handoff_result:
                        results.append(handoff_result)

                if not result.success and stage.required:
                    task.status = TaskStatus.FAILED
                    return results

            except Exception as err:
                if self.config.on_error:
                    self.config.on_error(err, task)

                if stage.required:
                    task.status = TaskStatus.FAILED
                    raise

        task.status = TaskStatus.COMPLETED
        return results

    async def _handle_handoff(
        self,
        handoff: HandoffRequest,
        task: Task,
        context: SharedContext,
    ) -> TaskResult | None:
        """Process a handoff request by routing to the target agent."""
        agent = self._agents.get(handoff.to_role)
        if agent is None:
            return None

        context.metadata["handoff_reason"] = handoff.reason
        context.metadata["handoff_from"] = handoff.from_role
        context.metadata["handoff_context"] = handoff.context

        return await agent.execute(task, context)
