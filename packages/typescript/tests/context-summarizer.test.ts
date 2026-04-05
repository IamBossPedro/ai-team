import { describe, it, expect } from "vitest";
import {
  summarizeContext,
  estimateContextTokens,
} from "../src/context-summarizer.js";
import { AgentRole } from "../src/types.js";
import type { SharedContext, ContextEntry } from "../src/types.js";

function makeEntry(role: AgentRole, summary: string): ContextEntry {
  return {
    role,
    action: `Action by ${role}`,
    summary,
    timestamp: new Date().toISOString(),
  };
}

function makeContext(entryCount: number): SharedContext {
  const history: ContextEntry[] = [];
  const roles = Object.values(AgentRole);
  for (let i = 0; i < entryCount; i++) {
    history.push(makeEntry(roles[i % roles.length], `Summary ${i}: ${"x".repeat(300)}`));
  }
  return { taskId: "TASK-001", history, files: {}, metadata: {} };
}

describe("summarizeContext", () => {
  it("does not modify context below threshold", () => {
    const ctx = makeContext(3);
    const result = summarizeContext(ctx);
    expect(result.history).toHaveLength(3);
    expect(result.history[0].action).not.toContain("[Summarized]");
  });

  it("summarizes context above threshold", () => {
    const ctx = makeContext(8);
    const result = summarizeContext(ctx, { triggerThreshold: 5 });
    expect(result.history).toHaveLength(8);
    // Older entries should be compressed
    expect(result.history[0].action).toContain("[Summarized]");
    // Recent entries should be full
    expect(result.history[7].action).not.toContain("[Summarized]");
  });

  it("truncates long summaries", () => {
    const ctx = makeContext(10);
    const result = summarizeContext(ctx, {
      triggerThreshold: 5,
      maxSummaryLength: 50,
    });
    const compressed = result.history[0];
    expect(compressed.summary.length).toBeLessThanOrEqual(53); // 50 + "..."
  });
});

describe("estimateContextTokens", () => {
  it("returns a number", () => {
    const ctx = makeContext(3);
    const tokens = estimateContextTokens(ctx);
    expect(typeof tokens).toBe("number");
    expect(tokens).toBeGreaterThan(0);
  });

  it("grows with context size", () => {
    const small = estimateContextTokens(makeContext(2));
    const large = estimateContextTokens(makeContext(10));
    expect(large).toBeGreaterThan(small);
  });
});
