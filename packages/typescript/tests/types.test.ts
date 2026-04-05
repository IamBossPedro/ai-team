import { describe, it, expect } from "vitest";
import {
  AgentRole,
  TaskStatus,
  TaskType,
} from "../src/types.js";
import type {
  Task,
  TaskResult,
  HandoffRequest,
  SharedContext,
  Pipeline,
  PipelineStage,
  AgentConfig,
} from "../src/types.js";

describe("AgentRole", () => {
  it("has 9 roles", () => {
    expect(Object.values(AgentRole)).toHaveLength(9);
  });

  it("has correct values", () => {
    expect(AgentRole.ProjectManager).toBe("project-manager");
    expect(AgentRole.TechLead).toBe("tech-lead");
    expect(AgentRole.BackendDeveloper).toBe("backend-developer");
    expect(AgentRole.FrontendDeveloper).toBe("frontend-developer");
    expect(AgentRole.QAEngineer).toBe("qa-engineer");
    expect(AgentRole.DevOpsEngineer).toBe("devops-engineer");
    expect(AgentRole.DBA).toBe("dba");
    expect(AgentRole.SecurityAnalyst).toBe("security-analyst");
    expect(AgentRole.TechnicalWriter).toBe("technical-writer");
  });
});

describe("TaskStatus", () => {
  it("has 6 statuses", () => {
    expect(Object.values(TaskStatus)).toHaveLength(6);
  });

  it("has correct values", () => {
    expect(TaskStatus.Created).toBe("created");
    expect(TaskStatus.InProgress).toBe("in_progress");
    expect(TaskStatus.Completed).toBe("completed");
    expect(TaskStatus.Failed).toBe("failed");
  });
});

describe("TaskType", () => {
  it("has 10 types", () => {
    expect(Object.values(TaskType)).toHaveLength(10);
  });

  it("has correct values", () => {
    expect(TaskType.BackendFeature).toBe("backend-feature");
    expect(TaskType.BugFix).toBe("bug-fix");
    expect(TaskType.DBMigration).toBe("db-migration");
  });
});

describe("Type interfaces", () => {
  it("creates a Task", () => {
    const task: Task = {
      id: "TASK-001",
      type: TaskType.BackendFeature,
      title: "Test",
      description: "Test task",
      status: TaskStatus.Created,
      priority: "medium",
    };
    expect(task.id).toBe("TASK-001");
    expect(task.assignedTo).toBeUndefined();
  });

  it("creates a SharedContext", () => {
    const ctx: SharedContext = {
      taskId: "TASK-001",
      history: [],
      files: {},
      metadata: {},
    };
    expect(ctx.history).toHaveLength(0);
  });

  it("creates a Pipeline with stages", () => {
    const pipeline: Pipeline = {
      name: "Test",
      taskType: TaskType.BackendFeature,
      stages: [
        { role: AgentRole.BackendDeveloper, action: "implement", required: true },
      ],
    };
    expect(pipeline.stages).toHaveLength(1);
    expect(pipeline.stages[0].parallel).toBeUndefined();
  });
});
