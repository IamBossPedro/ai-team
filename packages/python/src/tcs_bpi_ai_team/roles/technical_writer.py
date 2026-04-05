"""Technical Writer agent."""

from __future__ import annotations

from tcs_bpi_ai_team.agent import Agent
from tcs_bpi_ai_team.types import AgentConfig, AgentRole, TaskType

_HANDLED_TASK_TYPES = [
    TaskType.DOCUMENTATION,
    TaskType.BACKEND_FEATURE,
    TaskType.FRONTEND_FEATURE,
]


class TechnicalWriter(Agent):
    """Technical Writer — documentation, API docs, runbooks."""

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(role=AgentRole.TECHNICAL_WRITER))

    def can_handle(self, task_type: TaskType) -> bool:
        return task_type in _HANDLED_TASK_TYPES
