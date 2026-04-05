import { describe, it, expect, vi } from "vitest";
import { Orchestrator } from "../src/orchestrator.js";
import { Agent } from "../src/agent.js";
import { AgentRole, TaskStatus, TaskType } from "../src/types.js";
import type {
  AgentConfig,
  OrchestratorConfig,
  Pipeline,
  PipelineStage,
  SharedContext,
  Task,
  TaskResult,
} from "../src/types.js";

class MockAgent extends Agent {
  private output: string;
  private shouldSucceed: boolean;

  constructor(role: AgentRole, output = "Done.", success = true) {
    super({ role, systemPrompt: "mock" });
    this.output = output;
    this.shouldSucceed = success;
  }

  canHandle(_taskType: TaskType): boolean {
    return true;
  }

  async execute(task: Task, _context: SharedContext): Promise<TaskResult> {
    return {
      taskId: task.id,
      agentRole: this.role,
      success: this.shouldSucceed,
      output: this.output,
    };
  }
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "TASK-001",
    type: TaskType.BackendFeature,
    title: "Test task",
    description: "A test task",
    status: TaskStatus.Created,
    priority: "medium",
    ...overrides,
  };
}

describe("Orchestrator", () => {
  describe("registration", () => {
    it("registers a single agent", () => {
      const orch = new Orchestrator();
      orch.registerAgent(new MockAgent(AgentRole.BackendDeveloper));
      expect(orch.getRegisteredRoles()).toContain(AgentRole.BackendDeveloper);
    });

    it("registers multiple agents", () => {
      const orch = new Orchestrator();
      orch.registerAgents([
        new MockAgent(AgentRole.TechLead),
        new MockAgent(AgentRole.BackendDeveloper),
        new MockAgent(AgentRole.QAEngineer),
      ]);
      const roles = orch.getRegisteredRoles();
      expect(roles).toHaveLength(3);
      expect(roles).toContain(AgentRole.TechLead);
      expect(roles).toContain(AgentRole.BackendDeveloper);
      expect(roles).toContain(AgentRole.QAEngineer);
    });
  });

  describe("pipelines", () => {
    it("has 10 default pipelines", () => {
      const orch = new Orchestrator();
      for (const type of Object.values(TaskType)) {
        expect(orch.getPipeline(type)).toBeDefined();
      }
    });

    it("returns undefined for non-existent pipeline with custom config", () => {
      const orch = new Orchestrator({ pipelines: [] });
      expect(orch.getPipeline(TaskType.BackendFeature)).toBeUndefined();
    });

    it("uses custom pipelines", () => {
      const custom: Pipeline[] = [
        {
          name: "Custom",
          taskType: TaskType.BackendFeature,
          stages: [{ role: AgentRole.BackendDeveloper, action: "do-it", required: true }],
        },
      ];
      const orch = new Orchestrator({ pipelines: custom });
      const pipeline = orch.getPipeline(TaskType.BackendFeature);
      expect(pipeline?.name).toBe("Custom");
      expect(pipeline?.stages).toHaveLength(1);
    });
  });

  describe("submitTask", () => {
    it("executes full pipeline successfully", async () => {
      const orch = new Orchestrator();
      orch.registerAgents([
        new MockAgent(AgentRole.TechLead, "Plan"),
        new MockAgent(AgentRole.BackendDeveloper, "Code"),
        new MockAgent(AgentRole.QAEngineer, "Tests pass"),
      ]);

      const task = makeTask();
      const results = await orch.submitTask(task);

      expect(results).toHaveLength(3);
      expect(results[0].agentRole).toBe(AgentRole.TechLead);
      expect(results[1].agentRole).toBe(AgentRole.BackendDeveloper);
      expect(results[2].agentRole).toBe(AgentRole.QAEngineer);
      expect(task.status).toBe(TaskStatus.Completed);
    });

    it("throws for missing pipeline", async () => {
      const orch = new Orchestrator({ pipelines: [] });
      const task = makeTask();
      await expect(orch.submitTask(task)).rejects.toThrow("No pipeline defined");
    });

    it("throws for missing required agent", async () => {
      const orch = new Orchestrator();
      orch.registerAgent(new MockAgent(AgentRole.TechLead));
      const task = makeTask();
      await expect(orch.submitTask(task)).rejects.toThrow("Required agent role");
    });

    it("skips optional stages with missing agents", async () => {
      const custom: Pipeline[] = [
        {
          name: "Test",
          taskType: TaskType.BackendFeature,
          stages: [
            { role: AgentRole.BackendDeveloper, action: "do", required: true },
            { role: AgentRole.SecurityAnalyst, action: "review", required: false },
          ],
        },
      ];
      const orch = new Orchestrator({ pipelines: custom });
      orch.registerAgent(new MockAgent(AgentRole.BackendDeveloper));

      const task = makeTask();
      const results = await orch.submitTask(task);

      expect(results).toHaveLength(1);
      expect(task.status).toBe(TaskStatus.Completed);
    });

    it("stops pipeline on required stage failure", async () => {
      const custom: Pipeline[] = [
        {
          name: "Test",
          taskType: TaskType.BackendFeature,
          stages: [
            { role: AgentRole.BackendDeveloper, action: "do", required: true },
            { role: AgentRole.QAEngineer, action: "test", required: true },
          ],
        },
      ];
      const orch = new Orchestrator({ pipelines: custom });
      orch.registerAgents([
        new MockAgent(AgentRole.BackendDeveloper, "Failed", false),
        new MockAgent(AgentRole.QAEngineer, "Tests"),
      ]);

      const task = makeTask();
      const results = await orch.submitTask(task);

      expect(results).toHaveLength(1);
      expect(task.status).toBe(TaskStatus.Failed);
    });
  });

  describe("callbacks", () => {
    it("calls onTaskComplete for each stage", async () => {
      const completed: TaskResult[] = [];
      const custom: Pipeline[] = [
        {
          name: "Test",
          taskType: TaskType.BackendFeature,
          stages: [
            { role: AgentRole.BackendDeveloper, action: "do", required: true },
          ],
        },
      ];
      const orch = new Orchestrator({
        pipelines: custom,
        onTaskComplete: (r) => completed.push(r),
      });
      orch.registerAgent(new MockAgent(AgentRole.BackendDeveloper));

      await orch.submitTask(makeTask());
      expect(completed).toHaveLength(1);
    });

    it("calls onError on stage exception", async () => {
      const errors: Array<{ error: Error; task: Task }> = [];

      class FailingAgent extends Agent {
        canHandle() { return true; }
        async execute(): Promise<TaskResult> {
          throw new Error("API error");
        }
      }

      const custom: Pipeline[] = [
        {
          name: "Test",
          taskType: TaskType.BackendFeature,
          stages: [
            { role: AgentRole.BackendDeveloper, action: "do", required: true },
          ],
        },
      ];
      const orch = new Orchestrator({
        pipelines: custom,
        onError: (e, t) => errors.push({ error: e, task: t }),
      });
      orch.registerAgent(new FailingAgent({ role: AgentRole.BackendDeveloper, systemPrompt: "mock" }));

      const task = makeTask();
      await expect(orch.submitTask(task)).rejects.toThrow("API error");
      expect(errors).toHaveLength(1);
    });
  });
});
