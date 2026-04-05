// Core
export { Agent } from "./agent.js";
export { Orchestrator } from "./orchestrator.js";

// Types
export {
  AgentRole,
  TaskStatus,
  TaskType,
} from "./types.js";
export type {
  AgentConfig,
  ContextEntry,
  HandoffRequest,
  OrchestratorConfig,
  Pipeline,
  PipelineStage,
  SharedContext,
  Task,
  TaskResult,
} from "./types.js";

// Pipeline loading
export { loadPipelinesFromDirectory, parsePipelineYaml } from "./pipeline-loader.js";

// Parallel execution
export {
  executeParallelGroup,
  identifyParallelGroups,
  isParallelGroup,
} from "./parallel-executor.js";
export type { ParallelGroup } from "./parallel-executor.js";

// Context summarization
export {
  summarizeContext,
  estimateContextTokens,
} from "./context-summarizer.js";
export type { SummarizerConfig } from "./context-summarizer.js";

// Logging
export { Logger, LogLevel } from "./logger.js";
export type { LogEntry, LoggerConfig } from "./logger.js";

// Tracing
export { Tracer } from "./tracer.js";
export type { Trace, Span } from "./tracer.js";

// Role implementations
export {
  BackendDeveloper,
  QAEngineer,
  ProjectManager,
  TechLead,
  FrontendDeveloper,
  DevOpsEngineer,
  DBA,
  SecurityAnalyst,
  TechnicalWriter,
} from "./roles/index.js";
