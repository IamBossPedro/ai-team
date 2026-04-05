/**
 * YAML Pipeline Loader — loads pipeline definitions from YAML files.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import type { Pipeline, PipelineStage } from "./types.js";
import { AgentRole, TaskType } from "./types.js";

/**
 * Raw YAML pipeline shape (before validation).
 */
interface RawPipelineStage {
  role: string;
  action: string;
  required?: boolean;
  parallel?: boolean;
}

interface RawPipeline {
  name: string;
  task_type: string;
  stages: RawPipelineStage[];
}

/**
 * Validate that a string is a valid AgentRole.
 */
function validateRole(role: string): AgentRole {
  const values = Object.values(AgentRole) as string[];
  if (!values.includes(role)) {
    throw new Error(`Invalid agent role: "${role}". Valid roles: ${values.join(", ")}`);
  }
  return role as AgentRole;
}

/**
 * Validate that a string is a valid TaskType.
 */
function validateTaskType(taskType: string): TaskType {
  const values = Object.values(TaskType) as string[];
  if (!values.includes(taskType)) {
    throw new Error(`Invalid task type: "${taskType}". Valid types: ${values.join(", ")}`);
  }
  return taskType as TaskType;
}

/**
 * Parse a YAML pipeline definition string into a Pipeline object.
 * Uses a simple YAML parser (no external dependency).
 */
export function parsePipelineYaml(content: string): Pipeline {
  const raw = parseSimpleYaml(content) as unknown as RawPipeline;

  if (!raw.name || !raw.task_type || !raw.stages) {
    throw new Error("Pipeline YAML must have 'name', 'task_type', and 'stages' fields.");
  }

  const taskType = validateTaskType(raw.task_type);
  const stages: PipelineStage[] = raw.stages.map((s, i) => {
    if (!s.role || !s.action) {
      throw new Error(`Stage ${i} must have 'role' and 'action' fields.`);
    }
    return {
      role: validateRole(s.role),
      action: s.action,
      required: s.required !== false,
      parallel: s.parallel === true,
    };
  });

  return { name: raw.name, taskType, stages };
}

/**
 * Load all pipeline YAML files from a directory.
 */
export function loadPipelinesFromDirectory(dir: string): Pipeline[] {
  if (!existsSync(dir)) {
    return [];
  }

  const files = readdirSync(dir).filter(
    (f) => extname(f) === ".yml" || extname(f) === ".yaml"
  );

  return files.map((file) => {
    const content = readFileSync(join(dir, file), "utf-8");
    try {
      return parsePipelineYaml(content);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Error loading pipeline from ${file}: ${msg}`);
    }
  });
}

/**
 * Minimal YAML parser for pipeline definitions.
 * Handles simple key-value pairs and arrays of objects.
 * NOT a full YAML parser — only supports the pipeline schema.
 */
function parseSimpleYaml(content: string): Record<string, unknown> {
  const lines = content.split("\n");
  const result: Record<string, unknown> = {};
  let currentArray: Record<string, unknown>[] | null = null;
  let currentArrayKey = "";
  let currentItem: Record<string, unknown> | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }

    // Array item start: "  - key: value"
    const arrayItemMatch = line.match(/^(\s*)- (\w+):\s*(.+)$/);
    if (arrayItemMatch && currentArray !== null) {
      currentItem = { [arrayItemMatch[2]]: parseValue(arrayItemMatch[3]) };
      currentArray.push(currentItem);
      continue;
    }

    // Array item continuation: "    key: value"
    const arrayContMatch = line.match(/^\s{4,}(\w+):\s*(.+)$/);
    if (arrayContMatch && currentItem !== null) {
      currentItem[arrayContMatch[1]] = parseValue(arrayContMatch[2]);
      continue;
    }

    // Top-level key with value: "key: value"
    const kvMatch = line.match(/^(\w[\w_]*):\s*(.+)$/);
    if (kvMatch) {
      currentArray = null;
      currentItem = null;
      result[kvMatch[1]] = parseValue(kvMatch[2]);
      continue;
    }

    // Top-level key without value (start of array): "key:"
    const keyOnlyMatch = line.match(/^(\w[\w_]*):\s*$/);
    if (keyOnlyMatch) {
      currentArray = [];
      currentArrayKey = keyOnlyMatch[1];
      currentItem = null;
      result[currentArrayKey] = currentArray;
      continue;
    }
  }

  return result;
}

function parseValue(value: string): string | number | boolean {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  // Remove quotes if present
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
