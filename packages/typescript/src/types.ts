/**
 * Core type definitions for the TCS-BPI AI Team SDK.
 */

export enum AgentRole {
  ProjectManager = "project-manager",
  TechLead = "tech-lead",
  BackendDeveloper = "backend-developer",
  FrontendDeveloper = "frontend-developer",
  QAEngineer = "qa-engineer",
  DevOpsEngineer = "devops-engineer",
  DBA = "dba",
  SecurityAnalyst = "security-analyst",
  TechnicalWriter = "technical-writer",
}

export enum TaskStatus {
  Created = "created",
  Assigned = "assigned",
  InProgress = "in_progress",
  InReview = "in_review",
  Completed = "completed",
  Failed = "failed",
}

export enum TaskType {
  BackendFeature = "backend-feature",
  FrontendFeature = "frontend-feature",
  BugFix = "bug-fix",
  DBMigration = "db-migration",
  SecurityReview = "security-review",
  Documentation = "documentation",
  Infrastructure = "infrastructure",
  Testing = "testing",
  CodeReview = "code-review",
  SprintPlanning = "sprint-planning",
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo?: AgentRole;
  createdBy?: AgentRole;
  priority: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, unknown>;
}

export interface TaskResult {
  taskId: string;
  agentRole: AgentRole;
  success: boolean;
  output: string;
  filesChanged?: string[];
  handoffRequest?: HandoffRequest;
  metadata?: Record<string, unknown>;
}

export interface HandoffRequest {
  fromRole: AgentRole;
  toRole: AgentRole;
  reason: string;
  context: string;
  taskId: string;
}

export interface SharedContext {
  taskId: string;
  history: ContextEntry[];
  files: Record<string, string>;
  metadata: Record<string, unknown>;
}

export interface ContextEntry {
  role: AgentRole;
  action: string;
  summary: string;
  timestamp: string;
  filesChanged?: string[];
}

export interface Pipeline {
  name: string;
  taskType: TaskType;
  stages: PipelineStage[];
}

export interface PipelineStage {
  role: AgentRole;
  action: string;
  required: boolean;
}

export interface AgentConfig {
  role: AgentRole;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  allowedTools?: string[];
}

export interface OrchestratorConfig {
  pipelines?: Pipeline[];
  defaultModel?: string;
  maxTokens?: number;
  onTaskComplete?: (result: TaskResult) => void;
  onHandoff?: (handoff: HandoffRequest) => void;
  onError?: (error: Error, task: Task) => void;
}
