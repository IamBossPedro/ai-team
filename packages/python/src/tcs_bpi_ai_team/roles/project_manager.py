"""Project Manager agent."""

from __future__ import annotations

from tcs_bpi_ai_team.agent import Agent
from tcs_bpi_ai_team.types import AgentConfig, AgentRole, TaskType

_HANDLED_TASK_TYPES = [
    TaskType.SPRINT_PLANNING,
    TaskType.DOCUMENTATION,
]


class ProjectManager(Agent):
    """Project Manager — task creation, sprint planning, status tracking."""

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(role=AgentRole.PROJECT_MANAGER))

    def can_handle(self, task_type: TaskType) -> bool:
        return task_type in _HANDLED_TASK_TYPES
