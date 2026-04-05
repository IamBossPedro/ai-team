"""Core type definitions for the TCS-BPI AI Team SDK."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class AgentRole(StrEnum):
    PROJECT_MANAGER = "project-manager"
    TECH_LEAD = "tech-lead"
    BACKEND_DEVELOPER = "backend-developer"
    FRONTEND_DEVELOPER = "frontend-developer"
    QA_ENGINEER = "qa-engineer"
    DEVOPS_ENGINEER = "devops-engineer"
    DBA = "dba"
    SECURITY_ANALYST = "security-analyst"
    TECHNICAL_WRITER = "technical-writer"


class TaskStatus(StrEnum):
    CREATED = "created"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskType(StrEnum):
    BACKEND_FEATURE = "backend-feature"
    FRONTEND_FEATURE = "frontend-feature"
    BUG_FIX = "bug-fix"
    DB_MIGRATION = "db-migration"
    SECURITY_REVIEW = "security-review"
    DOCUMENTATION = "documentation"
    INFRASTRUCTURE = "infrastructure"
    TESTING = "testing"
    CODE_REVIEW = "code-review"
    SPRINT_PLANNING = "sprint-planning"


@dataclass
class Task:
    id: str
    type: TaskType
    title: str
    description: str
    status: TaskStatus
    priority: str  # "low" | "medium" | "high" | "critical"
    assigned_to: AgentRole | None = None
    created_by: AgentRole | None = None
    metadata: dict[str, Any] | None = None


@dataclass
class TaskResult:
    task_id: str
    agent_role: AgentRole
    success: bool
    output: str
    files_changed: list[str] | None = None
    handoff_request: HandoffRequest | None = None
    metadata: dict[str, Any] | None = None


@dataclass
class HandoffRequest:
    from_role: AgentRole
    to_role: AgentRole
    reason: str
    context: str
    task_id: str


@dataclass
class SharedContext:
    task_id: str
    history: list[ContextEntry] = field(default_factory=list)
    files: dict[str, str] = field(default_factory=dict)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ContextEntry:
    role: AgentRole
    action: str
    summary: str
    timestamp: str
    files_changed: list[str] | None = None


@dataclass
class PipelineStage:
    role: AgentRole
    action: str
    required: bool = True


@dataclass
class Pipeline:
    name: str
    task_type: TaskType
    stages: list[PipelineStage] = field(default_factory=list)


@dataclass
class AgentConfig:
    role: AgentRole
    model: str | None = None
    max_tokens: int | None = None
    temperature: float | None = None
    system_prompt: str | None = None
    allowed_tools: list[str] | None = None


@dataclass
class OrchestratorConfig:
    pipelines: list[Pipeline] | None = None
    default_model: str | None = None
    max_tokens: int | None = None
    on_task_complete: Callable[[TaskResult], None] | None = None
    on_handoff: Callable[[HandoffRequest], None] | None = None
    on_error: Callable[[Exception, Task], None] | None = None
