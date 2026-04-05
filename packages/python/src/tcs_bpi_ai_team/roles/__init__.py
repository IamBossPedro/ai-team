"""Role implementations for the AI team."""

from __future__ import annotations

from typing import TYPE_CHECKING

from tcs_bpi_ai_team.roles.backend_developer import BackendDeveloper
from tcs_bpi_ai_team.roles.dba import DBA
from tcs_bpi_ai_team.roles.devops_engineer import DevOpsEngineer
from tcs_bpi_ai_team.roles.frontend_developer import FrontendDeveloper
from tcs_bpi_ai_team.roles.project_manager import ProjectManager
from tcs_bpi_ai_team.roles.qa_engineer import QAEngineer
from tcs_bpi_ai_team.roles.security_analyst import SecurityAnalyst
from tcs_bpi_ai_team.roles.tech_lead import TechLead
from tcs_bpi_ai_team.roles.technical_writer import TechnicalWriter

if TYPE_CHECKING:
    from tcs_bpi_ai_team.agent import Agent
    from tcs_bpi_ai_team.types import AgentRole

# Registry mapping role enum values to classes
_ROLE_REGISTRY: dict[str, type[Agent]] = {
    "project-manager": ProjectManager,
    "tech-lead": TechLead,
    "backend-developer": BackendDeveloper,
    "frontend-developer": FrontendDeveloper,
    "qa-engineer": QAEngineer,
    "devops-engineer": DevOpsEngineer,
    "dba": DBA,
    "security-analyst": SecurityAnalyst,
    "technical-writer": TechnicalWriter,
}

__all__ = [
    "BackendDeveloper",
    "DBA",
    "DevOpsEngineer",
    "FrontendDeveloper",
    "ProjectManager",
    "QAEngineer",
    "SecurityAnalyst",
    "TechLead",
    "TechnicalWriter",
    "get_agent_class",
]


def get_agent_class(role: AgentRole) -> type[Agent]:
    """Get the Agent subclass for a given role."""
    cls = _ROLE_REGISTRY.get(str(role))
    if cls is None:
        msg = f"No agent class registered for role: {role}"
        raise ValueError(msg)
    return cls
