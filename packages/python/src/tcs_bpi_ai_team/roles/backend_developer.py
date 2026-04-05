"""Backend Developer agent."""

from __future__ import annotations

from tcs_bpi_ai_team.agent import Agent
from tcs_bpi_ai_team.types import AgentConfig, AgentRole, TaskType

_HANDLED_TASK_TYPES = [
    TaskType.BACKEND_FEATURE,
    TaskType.BUG_FIX,
    TaskType.DB_MIGRATION,
    TaskType.CODE_REVIEW,
]


class BackendDeveloper(Agent):
    """Senior backend developer — APIs, services, data access, tests."""

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(role=AgentRole.BACKEND_DEVELOPER))

    def can_handle(self, task_type: TaskType) -> bool:
        return task_type in _HANDLED_TASK_TYPES
