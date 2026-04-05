"""Database Administrator agent."""

from __future__ import annotations

from tcs_bpi_ai_team.agent import Agent
from tcs_bpi_ai_team.types import AgentConfig, AgentRole, TaskType

_HANDLED_TASK_TYPES = [
    TaskType.DB_MIGRATION,
    TaskType.BACKEND_FEATURE,
]


class DBA(Agent):
    """Database Administrator — schema design, migrations, query optimization."""

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(role=AgentRole.DBA))

    def can_handle(self, task_type: TaskType) -> bool:
        return task_type in _HANDLED_TASK_TYPES
