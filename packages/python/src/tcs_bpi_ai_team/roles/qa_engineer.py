"""QA Engineer agent."""

from __future__ import annotations

from tcs_bpi_ai_team.agent import Agent
from tcs_bpi_ai_team.types import AgentConfig, AgentRole, TaskType

_HANDLED_TASK_TYPES = [
    TaskType.TESTING,
    TaskType.BUG_FIX,
    TaskType.BACKEND_FEATURE,
    TaskType.FRONTEND_FEATURE,
    TaskType.DB_MIGRATION,
    TaskType.SECURITY_REVIEW,
]


class QAEngineer(Agent):
    """QA Engineer — testing, test plans, bug verification."""

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(role=AgentRole.QA_ENGINEER))

    def can_handle(self, task_type: TaskType) -> bool:
        return task_type in _HANDLED_TASK_TYPES
