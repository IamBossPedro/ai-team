import { describe, it, expect, vi } from "vitest";
import { Agent } from "../src/agent.js";
import { AgentRole, TaskStatus, TaskType } from "../src/types.js";
import type { AgentConfig, SharedContext, Task, TaskResult } from "../src/types.js";

class TestAgent extends Agent {
  canHandle(taskType: TaskType): boolean {
    return [TaskType.BackendFeature, TaskType.BugFix].includes(taskType);
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

function makeContext(overrides: Partial<SharedContext> = {}): SharedContext {
  return {
    taskId: "TASK-001",
    history: [],
    files: {},
    metadata: {},
    ...overrides,
  };
}

describe("Agent", () => {
  describe("construction", () => {
    it("creates an agent with default prompts", () => {
      const agent = new TestAgent({ role: AgentRole.BackendDeveloper });
      expect(agent.role).toBe(AgentRole.BackendDeveloper);
      expect(typeof agent.systemPrompt).toBe("string");
      expect(typeof agent.boundaries).toBe("string");
    });

    it("uses custom system prompt when provided", () => {
      const agent = new TestAgent({
        role: AgentRole.BackendDeveloper,
        systemPrompt: "Custom prompt",
      });
      expect(agent.systemPrompt).toBe("Custom prompt");
    });
  });

  describe("canHandle", () => {
    it("returns true for handled types", () => {
      const agent = new TestAgent({ role: AgentRole.BackendDeveloper });
      expect(agent.canHandle(TaskType.BackendFeature)).toBe(true);
      expect(agent.canHandle(TaskType.BugFix)).toBe(true);
    });

    it("returns false for unhandled types", () => {
      const agent = new TestAgent({ role: AgentRole.BackendDeveloper });
      expect(agent.canHandle(TaskType.Documentation)).toBe(false);
      expect(agent.canHandle(TaskType.Infrastructure)).toBe(false);
    });
  });

  describe("handoff", () => {
    it("creates a handoff request", () => {
      const agent = new TestAgent({ role: AgentRole.BackendDeveloper });
      const task = makeTask();

      const handoff = agent.handoff(
        task,
        AgentRole.QAEngineer,
        "Ready for testing",
        "Endpoint implemented"
      );

      expect(handoff.fromRole).toBe(AgentRole.BackendDeveloper);
      expect(handoff.toRole).toBe(AgentRole.QAEngineer);
      expect(handoff.reason).toBe("Ready for testing");
      expect(handoff.taskId).toBe("TASK-001");
    });
  });

  describe("message building", () => {
    it("builds system message with prompt", () => {
      const agent = new TestAgent({
        role: AgentRole.BackendDeveloper,
        systemPrompt: "You are a backend dev.",
      });
      const context = makeContext();
      const msg = (agent as any).buildSystemMessage(context);
      expect(msg).toContain("You are a backend dev.");
    });

    it("includes boundaries in system message", () => {
      const agent = new TestAgent({
        role: AgentRole.BackendDeveloper,
        systemPrompt: "Test",
      });
      // Set boundaries manually for testing
      (agent as any).boundaries = "Do not modify frontend files.";
      const context = makeContext();
      const msg = (agent as any).buildSystemMessage(context);
      expect(msg).toContain("Do not modify frontend files.");
    });

    it("includes prior context in system message", () => {
      const agent = new TestAgent({
        role: AgentRole.BackendDeveloper,
        systemPrompt: "Test",
      });
      const context = makeContext({
        history: [
          {
            role: AgentRole.TechLead,
            action: "Planned architecture",
            summary: "Use REST with Express",
            timestamp: "2025-01-01T00:00:00Z",
          },
        ],
      });
      const msg = (agent as any).buildSystemMessage(context);
      expect(msg).toContain("Prior Context from Team");
      expect(msg).toContain("tech-lead");
      expect(msg).toContain("Use REST with Express");
    });

    it("builds user message with task details", () => {
      const agent = new TestAgent({
        role: AgentRole.BackendDeveloper,
        systemPrompt: "Test",
      });
      const task = makeTask({ title: "Add user endpoint" });
      const context = makeContext();
      const msg = (agent as any).buildUserMessage(task, context);
      expect(msg).toContain("Add user endpoint");
      expect(msg).toContain("backend-feature");
      expect(msg).toContain("medium");
    });

    it("includes files in user message", () => {
      const agent = new TestAgent({
        role: AgentRole.BackendDeveloper,
        systemPrompt: "Test",
      });
      const task = makeTask();
      const context = makeContext({
        files: { "src/index.ts": "console.log('hello');" },
      });
      const msg = (agent as any).buildUserMessage(task, context);
      expect(msg).toContain("src/index.ts");
      expect(msg).toContain("console.log('hello');");
    });
  });
});
