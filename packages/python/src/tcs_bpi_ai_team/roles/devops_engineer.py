"""DevOps Engineer agent."""

from __future__ import annotations

from tcs_bpi_ai_team.agent import Agent
from tcs_bpi_ai_team.types import AgentConfig, AgentRole, TaskType

_HANDLED_TASK_TYPES = [
    TaskType.INFRASTRUCTURE,
    TaskType.BACKEND_FEATURE,
]


class DevOpsEngineer(Agent):
    """DevOps Engineer — CI/CD, infrastructure, deployment."""

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(role=AgentRole.DEVOPS_ENGINEER))

    def can_handle(self, task_type: TaskType) -> bool:
        return task_type in _HANDLED_TASK_TYPES
