"""Tests for the base Agent class."""

from __future__ import annotations

from unittest.mock import MagicMock, patch
from pathlib import Path

import pytest

from tcs_bpi_ai_team.agent import Agent, _load_role_prompt, _load_role_boundaries, create_agent
from tcs_bpi_ai_team.types import (
    AgentConfig,
    AgentRole,
    SharedContext,
    Task,
    TaskResult,
    TaskStatus,
    TaskType,
)


class ConcreteAgent(Agent):
    """Concrete test implementation of Agent."""

    def can_handle(self, task_type: TaskType) -> bool:
        return task_type in [TaskType.BACKEND_FEATURE, TaskType.BUG_FIX]


def make_task(**overrides: object) -> Task:
    defaults = dict(
        id="TASK-001",
        type=TaskType.BACKEND_FEATURE,
        title="Test task",
        description="A test task description",
        status=TaskStatus.CREATED,
        priority="medium",
    )
    defaults.update(overrides)
    return Task(**defaults)  # type: ignore[arg-type]


def make_context(**overrides: object) -> SharedContext:
    defaults = dict(task_id="TASK-001")
    defaults.update(overrides)
    return SharedContext(**defaults)  # type: ignore[arg-type]


class TestAgentConstruction:
    def test_agent_with_default_prompts(self) -> None:
        config = AgentConfig(role=AgentRole.BACKEND_DEVELOPER)
        agent = ConcreteAgent(config)
        assert agent.role == AgentRole.BACKEND_DEVELOPER
        # System prompt should be loaded from files (may be empty if roles/ not found)
        assert isinstance(agent.system_prompt, str)
        assert isinstance(agent.boundaries, str)

    def test_agent_with_custom_prompt(self) -> None:
        config = AgentConfig(
            role=AgentRole.BACKEND_DEVELOPER,
            system_prompt="Custom prompt",
        )
        agent = ConcreteAgent(config)
        assert agent.system_prompt == "Custom prompt"

    def test_can_handle(self) -> None:
        config = AgentConfig(role=AgentRole.BACKEND_DEVELOPER)
        agent = ConcreteAgent(config)
        assert agent.can_handle(TaskType.BACKEND_FEATURE) is True
        assert agent.can_handle(TaskType.BUG_FIX) is True
        assert agent.can_handle(TaskType.DOCUMENTATION) is False


class TestAgentHandoff:
    def test_handoff_creates_request(self) -> None:
        config = AgentConfig(role=AgentRole.BACKEND_DEVELOPER)
        agent = ConcreteAgent(config)
        task = make_task()

        handoff = agent.handoff(
            task,
            to_role=AgentRole.QA_ENGINEER,
            reason="Ready for testing",
            context="Endpoint implemented",
        )

        assert handoff.from_role == AgentRole.BACKEND_DEVELOPER
        assert handoff.to_role == AgentRole.QA_ENGINEER
        assert handoff.reason == "Ready for testing"
        assert handoff.task_id == "TASK-001"


class TestAgentMessageBuilding:
    def test_build_system_message_basic(self) -> None:
        config = AgentConfig(
            role=AgentRole.BACKEND_DEVELOPER,
            system_prompt="You are a backend developer.",
        )
        agent = ConcreteAgent(config)
        context = make_context()

        msg = agent._build_system_message(context)
        assert "You are a backend developer." in msg

    def test_build_system_message_with_boundaries(self) -> None:
        config = AgentConfig(
            role=AgentRole.BACKEND_DEVELOPER,
            system_prompt="You are a backend developer.",
        )
        agent = ConcreteAgent(config)
        # Manually set boundaries for testing
        agent.boundaries = "Do not modify frontend files."
        context = make_context()

        msg = agent._build_system_message(context)
        assert "Do not modify frontend files." in msg

    def test_build_user_message(self) -> None:
        config = AgentConfig(role=AgentRole.BACKEND_DEVELOPER, system_prompt="test")
        agent = ConcreteAgent(config)
        task = make_task(title="Add user endpoint", description="Create GET /api/users")
        context = make_context()

        msg = agent._build_user_message(task, context)
        assert "Add user endpoint" in msg
        assert "backend-feature" in msg
        assert "medium" in msg
        assert "Create GET /api/users" in msg

    def test_build_user_message_with_files(self) -> None:
        config = AgentConfig(role=AgentRole.BACKEND_DEVELOPER, system_prompt="test")
        agent = ConcreteAgent(config)
        task = make_task()
        context = make_context()
        context.files["src/index.ts"] = "console.log('hello');"

        msg = agent._build_user_message(task, context)
        assert "src/index.ts" in msg
        assert "console.log('hello');" in msg


class TestAgentExecution:
    @pytest.mark.asyncio
    async def test_execute_calls_api(self) -> None:
        config = AgentConfig(
            role=AgentRole.BACKEND_DEVELOPER,
            system_prompt="You are a backend dev.",
        )
        agent = ConcreteAgent(config)

        # Mock the Anthropic client
        mock_response = MagicMock()
        mock_text_block = MagicMock()
        mock_text_block.type = "text"
        mock_text_block.text = "Here is the implementation."
        mock_response.content = [mock_text_block]
        agent.client = MagicMock()
        agent.client.messages.create = MagicMock(return_value=mock_response)

        task = make_task()
        context = make_context()

        result = await agent.execute(task, context)

        assert result.success is True
        assert result.output == "Here is the implementation."
        assert result.task_id == "TASK-001"
        assert result.agent_role == AgentRole.BACKEND_DEVELOPER
        assert len(context.history) == 1
        assert context.history[0].role == AgentRole.BACKEND_DEVELOPER


class TestPromptLoading:
    def test_load_role_prompt_returns_string(self) -> None:
        prompt = _load_role_prompt(AgentRole.BACKEND_DEVELOPER)
        assert isinstance(prompt, str)
        # Should contain content from the role's system-prompt.md
        if prompt:
            assert len(prompt) > 0

    def test_load_role_boundaries_returns_string(self) -> None:
        boundaries = _load_role_boundaries(AgentRole.BACKEND_DEVELOPER)
        assert isinstance(boundaries, str)


class TestCreateAgent:
    def test_create_agent_factory(self) -> None:
        agent = create_agent(AgentRole.BACKEND_DEVELOPER)
        assert agent.role == AgentRole.BACKEND_DEVELOPER
        assert agent.can_handle(TaskType.BACKEND_FEATURE) is True

    def test_create_agent_with_config(self) -> None:
        agent = create_agent(AgentRole.TECH_LEAD, model="claude-opus-4-20250514")
        assert agent.role == AgentRole.TECH_LEAD
        assert agent.config.model == "claude-opus-4-20250514"
