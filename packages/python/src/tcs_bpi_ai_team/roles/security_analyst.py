"""Security Analyst agent."""

from __future__ import annotations

from tcs_bpi_ai_team.agent import Agent
from tcs_bpi_ai_team.types import AgentConfig, AgentRole, TaskType

_HANDLED_TASK_TYPES = [
    TaskType.SECURITY_REVIEW,
    TaskType.CODE_REVIEW,
    TaskType.INFRASTRUCTURE,
]


class SecurityAnalyst(Agent):
    """Security Analyst — security audits, vulnerability assessment, compliance."""

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(role=AgentRole.SECURITY_ANALYST))

    def can_handle(self, task_type: TaskType) -> bool:
        return task_type in _HANDLED_TASK_TYPES
