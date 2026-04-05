import { describe, it, expect } from "vitest";
import {
  identifyParallelGroups,
  isParallelGroup,
  executeParallelGroup,
} from "../src/parallel-executor.js";
import type { ParallelGroup } from "../src/parallel-executor.js";
import { Agent } from "../src/agent.js";
import { AgentRole, TaskStatus, TaskType } from "../src/types.js";
import type { PipelineStage, SharedContext, Task, TaskResult } from "../src/types.js";

class MockParallelAgent extends Agent {
  private output: string;
  constructor(role: AgentRole, output: string) {
    super({ role, systemPrompt: "mock" });
    this.output = output;
  }
  canHandle() { return true; }
  async execute(task: Task): Promise<TaskResult> {
    return { taskId: task.id, agentRole: this.role, success: true, output: this.output };
  }
}

describe("identifyParallelGroups", () => {
  it("returns sequential stages as-is", () => {
    const stages: PipelineStage[] = [
      { role: AgentRole.TechLead, action: "plan", required: true },
      { role: AgentRole.BackendDeveloper, action: "implement", required: true },
    ];
    const result = identifyParallelGroups(stages);
    expect(result).toHaveLength(2);
    expect(isParallelGroup(result[0])).toBe(false);
  });

  it("groups consecutive parallel stages", () => {
    const stages: PipelineStage[] = [
      { role: AgentRole.TechLead, action: "plan", required: true },
      { role: AgentRole.BackendDeveloper, action: "impl", required: true, parallel: true },
      { role: AgentRole.FrontendDeveloper, action: "impl", required: true, parallel: true },
      { role: AgentRole.QAEngineer, action: "test", required: true },
    ];
    const result = identifyParallelGroups(stages);
    expect(result).toHaveLength(3);
    expect(isParallelGroup(result[0])).toBe(false);
    expect(isParallelGroup(result[1])).toBe(true);
    expect((result[1] as ParallelGroup).stages).toHaveLength(2);
    expect(isParallelGroup(result[2])).toBe(false);
  });
});

describe("executeParallelGroup", () => {
  it("executes stages in parallel", async () => {
    const agents = new Map<AgentRole, Agent>([
      [AgentRole.BackendDeveloper, new MockParallelAgent(AgentRole.BackendDeveloper, "Backend done")],
      [AgentRole.FrontendDeveloper, new MockParallelAgent(AgentRole.FrontendDeveloper, "Frontend done")],
    ]);

    const group: ParallelGroup = {
      stages: [
        { role: AgentRole.BackendDeveloper, action: "impl", required: true },
        { role: AgentRole.FrontendDeveloper, action: "impl", required: true },
      ],
    };

    const task: Task = {
      id: "TASK-001",
      type: TaskType.BackendFeature,
      title: "Test",
      description: "Test",
      status: TaskStatus.InProgress,
      priority: "medium",
    };

    const context: SharedContext = { taskId: "TASK-001", history: [], files: {}, metadata: {} };

    const results = await executeParallelGroup(group, agents, task, context);
    expect(results).toHaveLength(2);
  });

  it("throws for missing required agent", async () => {
    const agents = new Map<AgentRole, Agent>();
    const group: ParallelGroup = {
      stages: [
        { role: AgentRole.BackendDeveloper, action: "impl", required: true },
      ],
    };
    const task: Task = {
      id: "TASK-001",
      type: TaskType.BackendFeature,
      title: "Test",
      description: "Test",
      status: TaskStatus.InProgress,
      priority: "medium",
    };
    const context: SharedContext = { taskId: "TASK-001", history: [], files: {}, metadata: {} };

    await expect(executeParallelGroup(group, agents, task, context)).rejects.toThrow();
  });
});
