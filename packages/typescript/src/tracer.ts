/**
 * Execution Tracer — structured tracing for pipeline execution.
 */

import { randomUUID } from "node:crypto";
import type { AgentRole } from "./types.js";

export interface Span {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  role?: AgentRole;
  action?: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: "running" | "completed" | "failed";
  metadata: Record<string, unknown>;
}

export interface Trace {
  id: string;
  taskId: string;
  pipelineName: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  spans: Span[];
  metadata: Record<string, unknown>;
}

export class Tracer {
  private traces: Map<string, Trace> = new Map();

  /**
   * Start a new trace for a pipeline execution.
   */
  startTrace(taskId: string, pipelineName: string): Trace {
    const trace: Trace = {
      id: randomUUID(),
      taskId,
      pipelineName,
      startTime: Date.now(),
      spans: [],
      metadata: {},
    };
    this.traces.set(trace.id, trace);
    return trace;
  }

  /**
   * End a trace.
   */
  endTrace(traceId: string): Trace | undefined {
    const trace = this.traces.get(traceId);
    if (trace) {
      trace.endTime = Date.now();
      trace.durationMs = trace.endTime - trace.startTime;
    }
    return trace;
  }

  /**
   * Start a new span within a trace.
   */
  startSpan(
    traceId: string,
    name: string,
    options: {
      role?: AgentRole;
      action?: string;
      parentId?: string;
    } = {}
  ): Span {
    const span: Span = {
      id: randomUUID(),
      traceId,
      parentId: options.parentId,
      name,
      role: options.role,
      action: options.action,
      startTime: Date.now(),
      status: "running",
      metadata: {},
    };

    const trace = this.traces.get(traceId);
    if (trace) {
      trace.spans.push(span);
    }

    return span;
  }

  /**
   * End a span.
   */
  endSpan(
    span: Span,
    status: "completed" | "failed" = "completed"
  ): void {
    span.endTime = Date.now();
    span.durationMs = span.endTime - span.startTime;
    span.status = status;
  }

  /**
   * Get a trace by ID.
   */
  getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  /**
   * Get all traces.
   */
  getAllTraces(): Trace[] {
    return Array.from(this.traces.values());
  }

  /**
   * Export a trace as JSON.
   */
  exportTraceJson(traceId: string): string | null {
    const trace = this.traces.get(traceId);
    if (!trace) return null;
    return JSON.stringify(trace, null, 2);
  }

  /**
   * Print a human-readable trace summary to console.
   */
  printTraceSummary(traceId: string): void {
    const trace = this.traces.get(traceId);
    if (!trace) {
      console.log("Trace not found:", traceId);
      return;
    }

    console.log(`\n📊 Trace: ${trace.pipelineName} (${trace.taskId})`);
    console.log(`   ID: ${trace.id}`);
    console.log(
      `   Duration: ${trace.durationMs ? `${trace.durationMs}ms` : "running"}`
    );
    console.log(`   Spans: ${trace.spans.length}\n`);

    for (const span of trace.spans) {
      const status =
        span.status === "completed"
          ? "✅"
          : span.status === "failed"
            ? "❌"
            : "⏳";
      const duration = span.durationMs ? `${span.durationMs}ms` : "...";
      const role = span.role ? ` [${span.role}]` : "";
      console.log(`   ${status} ${span.name}${role} — ${duration}`);
    }
    console.log();
  }

  /**
   * Clear all traces.
   */
  clear(): void {
    this.traces.clear();
  }
}
