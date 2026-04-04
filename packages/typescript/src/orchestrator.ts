import type {
  AgentRole,
  HandoffRequest,
  OrchestratorConfig,
  Pipeline,
  PipelineStage,
  SharedContext,
  Task,
  TaskResult,
  TaskStatus,
  TaskType,
} from "./types.js";
import { AgentRole as Roles, TaskStatus as Status, TaskType as Types } from "./types.js";
import type { Agent } from "./agent.js";

const DEFAULT_PIPELINES: Pipeline[] = [
  {
    name: "Backend Feature",
    taskType: Types.BackendFeature,
    stages: [
      { role: Roles.TechLead, action: "plan", required: true },
      { role: Roles.BackendDeveloper, action: "implement", required: true },
      { role: Roles.QAEngineer, action: "test", required: true },
    ],
  },
  {
    name: "Frontend Feature",
    taskType: Types.FrontendFeature,
    stages: [
      { role: Roles.TechLead, action: "plan", required: true },
      { role: Roles.FrontendDeveloper, action: "implement", required: true },
      { role: Roles.QAEngineer, action: "test", required: true },
    ],
  },
  {
    name: "Bug Fix",
    taskType: Types.BugFix,
    stages: [
      { role: Roles.QAEngineer, action: "reproduce", required: true },
      { role: Roles.BackendDeveloper, action: "fix", required: true },
      { role: Roles.QAEngineer, action: "verify", required: true },
    ],
  },
  {
    name: "Database Migration",
    taskType: Types.DBMigration,
    stages: [
      { role: Roles.DBA, action: "design", required: true },
      { role: Roles.BackendDeveloper, action: "integrate", required: true },
      { role: Roles.QAEngineer, action: "verify", required: true },
    ],
  },
  {
    name: "Security Review",
    taskType: Types.SecurityReview,
    stages: [
      { role: Roles.SecurityAnalyst, action: "audit", required: true },
      { role: Roles.BackendDeveloper, action: "fix", required: false },
      { role: Roles.SecurityAnalyst, action: "verify", required: true },
    ],
  },
  {
    name: "Documentation",
    taskType: Types.Documentation,
    stages: [
      { role: Roles.TechnicalWriter, action: "write", required: true },
      { role: Roles.TechLead, action: "review", required: false },
    ],
  },
  {
    name: "Infrastructure",
    taskType: Types.Infrastructure,
    stages: [
      { role: Roles.DevOpsEngineer, action: "implement", required: true },
      { role: Roles.SecurityAnalyst, action: "review", required: false },
    ],
  },
  {
    name: "Testing",
    taskType: Types.Testing,
    stages: [
      { role: Roles.QAEngineer, action: "write-tests", required: true },
    ],
  },
  {
    name: "Code Review",
    taskType: Types.CodeReview,
    stages: [
      { role: Roles.TechLead, action: "review", required: true },
      { role: Roles.SecurityAnalyst, action: "security-check", required: false },
    ],
  },
  {
    name: "Sprint Planning",
    taskType: Types.SprintPlanning,
    stages: [
      { role: Roles.ProjectManager, action: "plan", required: true },
      { role: Roles.TechLead, action: "estimate", required: true },
    ],
  },
];

export class Orchestrator {
  private agents: Map<AgentRole, Agent> = new Map();
  private pipelines: Pipeline[];
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig = {}) {
    this.config = config;
    this.pipelines = config.pipelines ?? DEFAULT_PIPELINES;
  }

  /**
   * Register an agent with the orchestrator.
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.role, agent);
  }

  /**
   * Register multiple agents at once.
   */
  registerAgents(agents: Agent[]): void {
    for (const agent of agents) {
      this.registerAgent(agent);
    }
  }

  /**
   * Get all registered agent roles.
   */
  getRegisteredRoles(): AgentRole[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get the pipeline for a given task type.
   */
  getPipeline(taskType: TaskType): Pipeline | undefined {
    return this.pipelines.find((p) => p.taskType === taskType);
  }

  /**
   * Submit a task for processing through its pipeline.
   * Returns results from each stage in order.
   */
  async submitTask(task: Task): Promise<TaskResult[]> {
    const pipeline = this.getPipeline(task.type);
    if (!pipeline) {
      throw new Error(`No pipeline defined for task type: ${task.type}`);
    }

    const context: SharedContext = {
      taskId: task.id,
      history: [],
      files: {},
      metadata: {},
    };

    const results: TaskResult[] = [];

    for (const stage of pipeline.stages) {
      const agent = this.agents.get(stage.role);

      if (!agent) {
        if (stage.required) {
          throw new Error(
            `Required agent role "${stage.role}" is not registered. ` +
            `Pipeline "${pipeline.name}" cannot proceed.`
          );
        }
        continue;
      }

      task.status = Status.InProgress as TaskStatus;
      task.assignedTo = stage.role;

      try {
        const result = await agent.execute(task, context);
        results.push(result);

        this.config.onTaskComplete?.(result);

        if (result.handoffRequest) {
          this.config.onHandoff?.(result.handoffRequest);
          const handoffResult = await this.handleHandoff(
            result.handoffRequest,
            task,
            context
          );
          if (handoffResult) {
            results.push(handoffResult);
          }
        }

        if (!result.success && stage.required) {
          task.status = Status.Failed as TaskStatus;
          return results;
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.config.onError?.(err, task);

        if (stage.required) {
          task.status = Status.Failed as TaskStatus;
          throw err;
        }
      }
    }

    task.status = Status.Completed as TaskStatus;
    return results;
  }

  /**
   * Process a handoff request by routing to the target agent.
   */
  private async handleHandoff(
    handoff: HandoffRequest,
    task: Task,
    context: SharedContext
  ): Promise<TaskResult | null> {
    const agent = this.agents.get(handoff.toRole);
    if (!agent) {
      return null;
    }

    context.metadata.handoffReason = handoff.reason;
    context.metadata.handoffFrom = handoff.fromRole;
    context.metadata.handoffContext = handoff.context;

    return agent.execute(task, context);
  }
}
