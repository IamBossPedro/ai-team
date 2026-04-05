import { describe, it, expect } from "vitest";
import { Tracer } from "../src/tracer.js";
import { AgentRole } from "../src/types.js";

describe("Tracer", () => {
  it("creates and ends a trace", () => {
    const tracer = new Tracer();
    const trace = tracer.startTrace("TASK-001", "Backend Feature");

    expect(trace.taskId).toBe("TASK-001");
    expect(trace.pipelineName).toBe("Backend Feature");
    expect(trace.id).toBeTruthy();
    expect(trace.startTime).toBeGreaterThan(0);
    expect(trace.endTime).toBeUndefined();

    const ended = tracer.endTrace(trace.id);
    expect(ended?.endTime).toBeGreaterThan(0);
    expect(ended?.durationMs).toBeDefined();
  });

  it("creates spans within a trace", () => {
    const tracer = new Tracer();
    const trace = tracer.startTrace("TASK-001", "Test");

    const span = tracer.startSpan(trace.id, "Plan", {
      role: AgentRole.TechLead,
      action: "plan",
    });

    expect(span.traceId).toBe(trace.id);
    expect(span.role).toBe(AgentRole.TechLead);
    expect(span.status).toBe("running");

    tracer.endSpan(span, "completed");
    expect(span.status).toBe("completed");
    expect(span.durationMs).toBeDefined();

    expect(trace.spans).toHaveLength(1);
  });

  it("exports trace as JSON", () => {
    const tracer = new Tracer();
    const trace = tracer.startTrace("TASK-001", "Test");
    tracer.endTrace(trace.id);

    const json = tracer.exportTraceJson(trace.id);
    expect(json).toBeTruthy();
    const parsed = JSON.parse(json!);
    expect(parsed.taskId).toBe("TASK-001");
  });

  it("returns null for non-existent trace", () => {
    const tracer = new Tracer();
    expect(tracer.getTrace("non-existent")).toBeUndefined();
    expect(tracer.exportTraceJson("non-existent")).toBeNull();
  });

  it("gets all traces", () => {
    const tracer = new Tracer();
    tracer.startTrace("TASK-001", "Test1");
    tracer.startTrace("TASK-002", "Test2");

    expect(tracer.getAllTraces()).toHaveLength(2);
  });

  it("clears traces", () => {
    const tracer = new Tracer();
    tracer.startTrace("TASK-001", "Test");
    tracer.clear();
    expect(tracer.getAllTraces()).toHaveLength(0);
  });
});
