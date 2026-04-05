"""Frontend Developer agent."""

from __future__ import annotations

from tcs_bpi_ai_team.agent import Agent
from tcs_bpi_ai_team.types import AgentConfig, AgentRole, TaskType

_HANDLED_TASK_TYPES = [
    TaskType.FRONTEND_FEATURE,
    TaskType.BUG_FIX,
    TaskType.CODE_REVIEW,
]


class FrontendDeveloper(Agent):
    """Senior frontend developer — UI components, client-side logic, styling."""

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(role=AgentRole.FRONTEND_DEVELOPER))

    def can_handle(self, task_type: TaskType) -> bool:
        return task_type in _HANDLED_TASK_TYPES
