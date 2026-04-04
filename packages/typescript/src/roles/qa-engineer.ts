import { Agent } from "../agent.js";
import { AgentRole, TaskType } from "../types.js";
import type { AgentConfig } from "../types.js";

const HANDLED_TASK_TYPES: TaskType[] = [
  TaskType.Testing,
  TaskType.BugFix,
  TaskType.BackendFeature,
  TaskType.FrontendFeature,
  TaskType.DBMigration,
  TaskType.SecurityReview,
];

export class QAEngineer extends Agent {
  constructor(config: Partial<AgentConfig> = {}) {
    super({
      role: AgentRole.QAEngineer,
      ...config,
    });
  }

  canHandle(taskType: TaskType): boolean {
    return HANDLED_TASK_TYPES.includes(taskType);
  }
}
