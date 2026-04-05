"""TCS-BPI AI Team — Shared AI agent team library."""

from tcs_bpi_ai_team.agent import Agent, create_agent

# Context summarization
from tcs_bpi_ai_team.context_summarizer import (
    SummarizerConfig,
    estimate_context_tokens,
    summarize_context,
)

# Logging
from tcs_bpi_ai_team.logger import LogEntry, Logger, LoggerConfig, LogLevel
from tcs_bpi_ai_team.orchestrator import Orchestrator

# Parallel execution
from tcs_bpi_ai_team.parallel_executor import (
    ParallelGroup,
    execute_parallel_group,
    identify_parallel_groups,
    is_parallel_group,
)

# Pipeline loading
from tcs_bpi_ai_team.pipeline_loader import load_pipelines_from_directory, parse_pipeline_yaml
from tcs_bpi_ai_team.roles import (
    DBA,
    BackendDeveloper,
    DevOpsEngineer,
    FrontendDeveloper,
    ProjectManager,
    QAEngineer,
    SecurityAnalyst,
    TechLead,
    TechnicalWriter,
)

# Tracing
from tcs_bpi_ai_team.tracer import Span, Trace, Tracer
from tcs_bpi_ai_team.types import (
    AgentConfig,
    AgentRole,
    ContextEntry,
    HandoffRequest,
    OrchestratorConfig,
    Pipeline,
    PipelineStage,
    SharedContext,
    Task,
    TaskResult,
    TaskStatus,
    TaskType,
)

__all__ = [
    # Core
    "Agent",
    "Orchestrator",
    "create_agent",
    # Types
    "AgentConfig",
    "AgentRole",
    "ContextEntry",
    "HandoffRequest",
    "OrchestratorConfig",
    "Pipeline",
    "PipelineStage",
    "SharedContext",
    "Task",
    "TaskResult",
    "TaskStatus",
    "TaskType",
    # Roles
    "BackendDeveloper",
    "DBA",
    "DevOpsEngineer",
    "FrontendDeveloper",
    "ProjectManager",
    "QAEngineer",
    "SecurityAnalyst",
    "TechLead",
    "TechnicalWriter",
    # Pipeline loading
    "load_pipelines_from_directory",
    "parse_pipeline_yaml",
    # Parallel execution
    "ParallelGroup",
    "execute_parallel_group",
    "identify_parallel_groups",
    "is_parallel_group",
    # Context summarization
    "SummarizerConfig",
    "estimate_context_tokens",
    "summarize_context",
    # Logging
    "LogEntry",
    "LogLevel",
    "Logger",
    "LoggerConfig",
    # Tracing
    "Span",
    "Trace",
    "Tracer",
]

__version__ = "0.1.0"
