import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  AgentConfig,
  AgentRole,
  HandoffRequest,
  SharedContext,
  Task,
  TaskResult,
  TaskType,
} from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROLES_DIR = join(__dirname, "..", "..", "..", "roles");

function loadRolePrompt(role: AgentRole): string {
  const basePath = join(ROLES_DIR, "_base", "system-prompt.md");
  const rolePath = join(ROLES_DIR, role, "system-prompt.md");

  let prompt = "";

  if (existsSync(basePath)) {
    prompt += readFileSync(basePath, "utf-8") + "\n\n";
  }

  if (existsSync(rolePath)) {
    prompt += readFileSync(rolePath, "utf-8");
  }

  return prompt;
}

function loadRoleBoundaries(role: AgentRole): string {
  const boundariesPath = join(ROLES_DIR, role, "boundaries.md");
  if (existsSync(boundariesPath)) {
    return readFileSync(boundariesPath, "utf-8");
  }
  return "";
}

export abstract class Agent {
  readonly role: AgentRole;
  readonly systemPrompt: string;
  readonly boundaries: string;
  protected client: Anthropic;
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.role = config.role;
    this.systemPrompt =
      config.systemPrompt ?? loadRolePrompt(config.role);
    this.boundaries = loadRoleBoundaries(config.role);
    this.client = new Anthropic();
  }

  /**
   * Check if this agent can handle a given task type.
   */
  abstract canHandle(taskType: TaskType): boolean;

  /**
   * Execute a task with shared context from prior agents in the pipeline.
   */
  async execute(task: Task, context: SharedContext): Promise<TaskResult> {
    const systemMessage = this.buildSystemMessage(context);
    const userMessage = this.buildUserMessage(task, context);

    const response = await this.client.messages.create({
      model: this.config.model ?? "claude-sonnet-4-20250514",
      max_tokens: this.config.maxTokens ?? 4096,
      temperature: this.config.temperature ?? 0,
      system: systemMessage,
      messages: [{ role: "user", content: userMessage }],
    });

    const output = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const result = this.parseResult(task, output);

    context.history.push({
      role: this.role,
      action: `Executed task: ${task.title}`,
      summary: output.slice(0, 500),
      timestamp: new Date().toISOString(),
      filesChanged: result.filesChanged,
    });

    return result;
  }

  /**
   * Request a handoff to another agent role.
   */
  handoff(
    task: Task,
    toRole: AgentRole,
    reason: string,
    context: string
  ): HandoffRequest {
    return {
      fromRole: this.role,
      toRole,
      reason,
      context,
      taskId: task.id,
    };
  }

  protected buildSystemMessage(context: SharedContext): string {
    let message = this.systemPrompt;

    if (this.boundaries) {
      message += `\n\n---\n\n${this.boundaries}`;
    }

    if (context.history.length > 0) {
      message += "\n\n---\n\n## Prior Context from Team\n\n";
      for (const entry of context.history) {
        message += `### ${entry.role} (${entry.timestamp})\n`;
        message += `**Action:** ${entry.action}\n`;
        message += `${entry.summary}\n\n`;
      }
    }

    return message;
  }

  protected buildUserMessage(task: Task, context: SharedContext): string {
    let message = `## Task: ${task.title}\n\n`;
    message += `**Type:** ${task.type}\n`;
    message += `**Priority:** ${task.priority}\n`;
    message += `**Description:** ${task.description}\n`;

    if (Object.keys(context.files).length > 0) {
      message += "\n## Relevant Files\n\n";
      for (const [path, content] of Object.entries(context.files)) {
        message += `### ${path}\n\`\`\`\n${content}\n\`\`\`\n\n`;
      }
    }

    if (Object.keys(context.metadata).length > 0) {
      message += `\n## Additional Context\n\n${JSON.stringify(context.metadata, null, 2)}\n`;
    }

    return message;
  }

  protected parseResult(task: Task, output: string): TaskResult {
    return {
      taskId: task.id,
      agentRole: this.role,
      success: true,
      output,
    };
  }
}
