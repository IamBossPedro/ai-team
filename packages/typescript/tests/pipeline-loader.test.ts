import { describe, it, expect } from "vitest";
import { parsePipelineYaml, loadPipelinesFromDirectory } from "../src/pipeline-loader.js";
import { AgentRole, TaskType } from "../src/types.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PIPELINES_DIR = join(__dirname, "..", "..", "..", "pipelines");

describe("parsePipelineYaml", () => {
  it("parses a valid pipeline YAML", () => {
    const yaml = `
name: Backend Feature
task_type: backend-feature
stages:
  - role: tech-lead
    action: plan
    required: true
  - role: backend-developer
    action: implement
    required: true
  - role: qa-engineer
    action: test
    required: true
`;
    const pipeline = parsePipelineYaml(yaml);
    expect(pipeline.name).toBe("Backend Feature");
    expect(pipeline.taskType).toBe(TaskType.BackendFeature);
    expect(pipeline.stages).toHaveLength(3);
    expect(pipeline.stages[0].role).toBe(AgentRole.TechLead);
    expect(pipeline.stages[0].action).toBe("plan");
    expect(pipeline.stages[0].required).toBe(true);
  });

  it("defaults required to true", () => {
    const yaml = `
name: Test
task_type: testing
stages:
  - role: qa-engineer
    action: test
`;
    const pipeline = parsePipelineYaml(yaml);
    expect(pipeline.stages[0].required).toBe(true);
  });

  it("handles required: false", () => {
    const yaml = `
name: Test
task_type: infrastructure
stages:
  - role: devops-engineer
    action: implement
    required: true
  - role: security-analyst
    action: review
    required: false
`;
    const pipeline = parsePipelineYaml(yaml);
    expect(pipeline.stages[1].required).toBe(false);
  });

  it("throws for invalid role", () => {
    const yaml = `
name: Test
task_type: backend-feature
stages:
  - role: invalid-role
    action: do
`;
    expect(() => parsePipelineYaml(yaml)).toThrow("Invalid agent role");
  });

  it("throws for invalid task type", () => {
    const yaml = `
name: Test
task_type: invalid-type
stages:
  - role: backend-developer
    action: do
`;
    expect(() => parsePipelineYaml(yaml)).toThrow("Invalid task type");
  });

  it("throws for missing fields", () => {
    const yaml = `name: Test`;
    expect(() => parsePipelineYaml(yaml)).toThrow("must have");
  });
});

describe("loadPipelinesFromDirectory", () => {
  it("loads all 10 pipeline YAML files", () => {
    const pipelines = loadPipelinesFromDirectory(PIPELINES_DIR);
    expect(pipelines).toHaveLength(10);
  });

  it("returns empty array for non-existent directory", () => {
    const pipelines = loadPipelinesFromDirectory("/non/existent/path");
    expect(pipelines).toHaveLength(0);
  });
});
