"""Base Agent class wrapping the Anthropic API."""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import UTC, datetime
from pathlib import Path

import anthropic

from tcs_bpi_ai_team.types import (
    AgentConfig,
    AgentRole,
    ContextEntry,
    HandoffRequest,
    SharedContext,
    Task,
    TaskResult,
    TaskType,
)

# Resolve the roles directory relative to this file
# packages/python/src/tcs_bpi_ai_team/agent.py -> ../../../../roles
_ROLES_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent / "roles"


def _load_role_prompt(role: AgentRole) -> str:
    """Load base + role-specific system prompt from markdown files."""
    base_path = _ROLES_DIR / "_base" / "system-prompt.md"
    role_path = _ROLES_DIR / str(role) / "system-prompt.md"

    prompt = ""
    if base_path.exists():
        prompt += base_path.read_text(encoding="utf-8") + "\n\n"
    if role_path.exists():
        prompt += role_path.read_text(encoding="utf-8")
    return prompt


def _load_role_boundaries(role: AgentRole) -> str:
    """Load role boundary definitions from markdown."""
    boundaries_path = _ROLES_DIR / str(role) / "boundaries.md"
    if boundaries_path.exists():
        return boundaries_path.read_text(encoding="utf-8")
    return ""


class Agent(ABC):
    """Abstract base class for all AI team agents."""

    def __init__(self, config: AgentConfig) -> None:
        self.config = config
        self.role = config.role
        self.system_prompt = config.system_prompt or _load_role_prompt(config.role)
        self.boundaries = _load_role_boundaries(config.role)
        self.client = anthropic.Anthropic()

    @abstractmethod
    def can_handle(self, task_type: TaskType) -> bool:
        """Check if this agent can handle a given task type."""
        ...

    async def execute(self, task: Task, context: SharedContext) -> TaskResult:
        """Execute a task with shared context from prior agents in the pipeline."""
        system_message = self._build_system_message(context)
        user_message = self._build_user_message(task, context)

        response = self.client.messages.create(
            model=self.config.model or "claude-sonnet-4-20250514",
            max_tokens=self.config.max_tokens or 4096,
            temperature=self.config.temperature or 0,
            system=system_message,
            messages=[{"role": "user", "content": user_message}],
        )

        output = "\n".join(
            block.text for block in response.content if block.type == "text"
        )

        result = self._parse_result(task, output)

        context.history.append(
            ContextEntry(
                role=self.role,
                action=f"Executed task: {task.title}",
                summary=output[:500],
                timestamp=datetime.now(UTC).isoformat(),
                files_changed=result.files_changed,
            )
        )

        return result

    def handoff(
        self,
        task: Task,
        to_role: AgentRole,
        reason: str,
        context: str,
    ) -> HandoffRequest:
        """Request a handoff to another agent role."""
        return HandoffRequest(
            from_role=self.role,
            to_role=to_role,
            reason=reason,
            context=context,
            task_id=task.id,
        )

    def _build_system_message(self, context: SharedContext) -> str:
        """Build the system message including prompt, boundaries, and prior context."""
        message = self.system_prompt

        if self.boundaries:
            message += f"\n\n---\n\n{self.boundaries}"

        if context.history:
            message += "\n\n---\n\n## Prior Context from Team\n\n"
            for entry in context.history:
                message += f"### {entry.role} ({entry.timestamp})\n"
                message += f"**Action:** {entry.action}\n"
                message += f"{entry.summary}\n\n"

        return message

    def _build_user_message(self, task: Task, context: SharedContext) -> str:
        """Build the user message with task details and file context."""
        import json

        message = f"## Task: {task.title}\n\n"
        message += f"**Type:** {task.type}\n"
        message += f"**Priority:** {task.priority}\n"
        message += f"**Description:** {task.description}\n"

        if context.files:
            message += "\n## Relevant Files\n\n"
            for path, content in context.files.items():
                message += f"### {path}\n```\n{content}\n```\n\n"

        if context.metadata:
            message += f"\n## Additional Context\n\n{json.dumps(context.metadata, indent=2)}\n"

        return message

    def _parse_result(self, task: Task, output: str) -> TaskResult:
        """Parse the raw output into a TaskResult."""
        return TaskResult(
            task_id=task.id,
            agent_role=self.role,
            success=True,
            output=output,
        )


def create_agent(role: AgentRole, **kwargs: object) -> Agent:
    """Factory function to create an agent by role.

    Usage:
        agent = create_agent(AgentRole.BACKEND_DEVELOPER)
        agent = create_agent(AgentRole.TECH_LEAD, model="claude-opus-4-20250514")
    """
    from tcs_bpi_ai_team.roles import get_agent_class

    agent_class = get_agent_class(role)
    config = AgentConfig(role=role, **kwargs)  # type: ignore[arg-type]
    return agent_class(config)
