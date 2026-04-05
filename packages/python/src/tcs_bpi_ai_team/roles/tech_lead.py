"""Tech Lead agent."""

from __future__ import annotations

from tcs_bpi_ai_team.agent import Agent
from tcs_bpi_ai_team.types import AgentConfig, AgentRole, TaskType

_HANDLED_TASK_TYPES = [
    TaskType.BACKEND_FEATURE,
    TaskType.FRONTEND_FEATURE,
    TaskType.CODE_REVIEW,
    TaskType.SPRINT_PLANNING,
    TaskType.DOCUMENTATION,
]


class TechLead(Agent):
    """Tech Lead / Architect — architecture decisions, code review, technical direction."""

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(role=AgentRole.TECH_LEAD))

    def can_handle(self, task_type: TaskType) -> bool:
        return task_type in _HANDLED_TASK_TYPES
