import { Agent } from "../agent.js";
import { AgentRole, TaskType } from "../types.js";
import type { AgentConfig } from "../types.js";

const HANDLED_TASK_TYPES: TaskType[] = [
  TaskType.Documentation,
];

export class TechnicalWriter extends Agent {
  constructor(config: Partial<AgentConfig> = {}) {
    super({
      role: AgentRole.TechnicalWriter,
      ...config,
    });
  }

  canHandle(taskType: TaskType): boolean {
    return HANDLED_TASK_TYPES.includes(taskType);
  }
}
