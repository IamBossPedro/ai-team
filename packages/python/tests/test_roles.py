"""Tests for role implementations."""

from tcs_bpi_ai_team.roles import (
    BackendDeveloper,
    DBA,
    DevOpsEngineer,
    FrontendDeveloper,
    ProjectManager,
    QAEngineer,
    SecurityAnalyst,
    TechLead,
    TechnicalWriter,
    get_agent_class,
)
from tcs_bpi_ai_team.types import AgentRole, TaskType


class TestRoleCanHandle:
    def test_backend_developer(self) -> None:
        agent = BackendDeveloper()
        assert agent.can_handle(TaskType.BACKEND_FEATURE) is True
        assert agent.can_handle(TaskType.BUG_FIX) is True
        assert agent.can_handle(TaskType.DB_MIGRATION) is True
        assert agent.can_handle(TaskType.CODE_REVIEW) is True
        assert agent.can_handle(TaskType.FRONTEND_FEATURE) is False

    def test_frontend_developer(self) -> None:
        agent = FrontendDeveloper()
        assert agent.can_handle(TaskType.FRONTEND_FEATURE) is True
        assert agent.can_handle(TaskType.BUG_FIX) is True
        assert agent.can_handle(TaskType.CODE_REVIEW) is True
        assert agent.can_handle(TaskType.DB_MIGRATION) is False

    def test_tech_lead(self) -> None:
        agent = TechLead()
        assert agent.can_handle(TaskType.BACKEND_FEATURE) is True
        assert agent.can_handle(TaskType.FRONTEND_FEATURE) is True
        assert agent.can_handle(TaskType.CODE_REVIEW) is True
        assert agent.can_handle(TaskType.SPRINT_PLANNING) is True
        assert agent.can_handle(TaskType.DOCUMENTATION) is True
        assert agent.can_handle(TaskType.INFRASTRUCTURE) is False

    def test_project_manager(self) -> None:
        agent = ProjectManager()
        assert agent.can_handle(TaskType.SPRINT_PLANNING) is True
        assert agent.can_handle(TaskType.DOCUMENTATION) is True
        assert agent.can_handle(TaskType.BACKEND_FEATURE) is False

    def test_qa_engineer(self) -> None:
        agent = QAEngineer()
        assert agent.can_handle(TaskType.TESTING) is True
        assert agent.can_handle(TaskType.BUG_FIX) is True
        assert agent.can_handle(TaskType.BACKEND_FEATURE) is True
        assert agent.can_handle(TaskType.FRONTEND_FEATURE) is True
        assert agent.can_handle(TaskType.DB_MIGRATION) is True
        assert agent.can_handle(TaskType.SECURITY_REVIEW) is True
        assert agent.can_handle(TaskType.INFRASTRUCTURE) is False

    def test_devops_engineer(self) -> None:
        agent = DevOpsEngineer()
        assert agent.can_handle(TaskType.INFRASTRUCTURE) is True
        assert agent.can_handle(TaskType.BACKEND_FEATURE) is True
        assert agent.can_handle(TaskType.FRONTEND_FEATURE) is False

    def test_dba(self) -> None:
        agent = DBA()
        assert agent.can_handle(TaskType.DB_MIGRATION) is True
        assert agent.can_handle(TaskType.BACKEND_FEATURE) is True
        assert agent.can_handle(TaskType.FRONTEND_FEATURE) is False

    def test_security_analyst(self) -> None:
        agent = SecurityAnalyst()
        assert agent.can_handle(TaskType.SECURITY_REVIEW) is True
        assert agent.can_handle(TaskType.CODE_REVIEW) is True
        assert agent.can_handle(TaskType.INFRASTRUCTURE) is True
        assert agent.can_handle(TaskType.BUG_FIX) is False

    def test_technical_writer(self) -> None:
        agent = TechnicalWriter()
        assert agent.can_handle(TaskType.DOCUMENTATION) is True
        assert agent.can_handle(TaskType.BACKEND_FEATURE) is True
        assert agent.can_handle(TaskType.FRONTEND_FEATURE) is True
        assert agent.can_handle(TaskType.DB_MIGRATION) is False


class TestRoleRegistry:
    def test_get_agent_class_all_roles(self) -> None:
        for role in AgentRole:
            cls = get_agent_class(role)
            assert cls is not None
            agent = cls()
            assert agent.role == role

    def test_get_agent_class_returns_correct_type(self) -> None:
        assert get_agent_class(AgentRole.BACKEND_DEVELOPER) is BackendDeveloper
        assert get_agent_class(AgentRole.TECH_LEAD) is TechLead
        assert get_agent_class(AgentRole.QA_ENGINEER) is QAEngineer


class TestRoleConstruction:
    def test_all_roles_instantiate(self) -> None:
        roles = [
            BackendDeveloper(),
            FrontendDeveloper(),
            TechLead(),
            ProjectManager(),
            QAEngineer(),
            DevOpsEngineer(),
            DBA(),
            SecurityAnalyst(),
            TechnicalWriter(),
        ]
        assert len(roles) == 9
        role_values = {r.role for r in roles}
        assert len(role_values) == 9  # All unique
