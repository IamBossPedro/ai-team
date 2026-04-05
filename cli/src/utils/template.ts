/**
 * Handlebars template compilation utilities.
 */

import Handlebars from "handlebars";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { RoleDefinition } from "./roles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "..", "..", "claude-code", "templates");

/**
 * Template context for rendering.
 */
export interface TemplateContext {
  projectName: string;
  repoPath: string;
  roles: RoleDefinition[];
  techStack?: string;
  customRules?: string[];
  agentsPath?: string;
}

/**
 * Compile and render a Handlebars template.
 */
export function renderTemplate(
  templateName: string,
  context: TemplateContext
): string {
  const templatePath = join(TEMPLATES_DIR, templateName);
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  const source = readFileSync(templatePath, "utf-8");
  const template = Handlebars.compile(source);
  return template(context);
}

/**
 * Render the CLAUDE.md template.
 */
export function renderClaudeMd(context: TemplateContext): string {
  return renderTemplate("CLAUDE.md.hbs", context);
}

/**
 * Render the AGENTS.md template.
 */
export function renderAgentsMd(context: TemplateContext): string {
  return renderTemplate("AGENTS.md.hbs", context);
}
