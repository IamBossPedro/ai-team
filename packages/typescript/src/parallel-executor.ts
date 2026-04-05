/**
 * Parallel Executor — runs multiple pipeline stages concurrently.
 */

import type { Agent } from "./agent.js";
import type {
  AgentRole,
  PipelineStage,
  SharedContext,
  Task,
  TaskResult,
} from "./types.js";

export interface ParallelGroup {
  stages: PipelineStage[];
}

/**
 * Identify groups of consecutive stages that can run in parallel.
 * Stages with `parallel: true` that are adjacent form a group.
 */
export function identifyParallelGroups(
  stages: PipelineStage[]
): (PipelineStage | ParallelGroup)[] {
  const result: (PipelineStage | ParallelGroup)[] = [];
  let currentGroup: PipelineStage[] = [];

  for (const stage of stages) {
    if ((stage as PipelineStage & { parallel?: boolean }).parallel) {
      currentGroup.push(stage);
    } else {
      if (currentGroup.length > 0) {
        result.push({ stages: currentGroup });
        currentGroup = [];
      }
      result.push(stage);
    }
  }

  if (currentGroup.length > 0) {
    result.push({ stages: currentGroup });
  }

  return result;
}

/**
 * Check if an item is a parallel group.
 */
export function isParallelGroup(
  item: PipelineStage | ParallelGroup
): item is ParallelGroup {
  return "stages" in item && Array.isArray((item as ParallelGroup).stages);
}

/**
 * Execute a group of stages in parallel using Promise.allSettled.
 */
export async function executeParallelGroup(
  group: ParallelGroup,
  agents: Map<AgentRole, Agent>,
  task: Task,
  context: SharedContext
): Promise<TaskResult[]> {
  const promises = group.stages.map(async (stage) => {
    const agent = agents.get(stage.role);
    if (!agent) {
      if (stage.required) {
        throw new Error(`Required agent role "${stage.role}" is not registered.`);
      }
      return null;
    }
    return agent.execute(task, context);
  });

  const settled = await Promise.allSettled(promises);
  const results: TaskResult[] = [];
  const errors: Error[] = [];

  for (let i = 0; i < settled.length; i++) {
    const outcome = settled[i];
    if (outcome.status === "fulfilled" && outcome.value !== null) {
      results.push(outcome.value);
    } else if (outcome.status === "rejected") {
      const stage = group.stages[i];
      if (stage.required) {
        errors.push(
          outcome.reason instanceof Error
            ? outcome.reason
            : new Error(String(outcome.reason))
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(
      errors,
      `${errors.length} required parallel stage(s) failed`
    );
  }

  return results;
}
