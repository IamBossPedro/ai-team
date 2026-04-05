/**
 * Role discovery and loading utilities.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROLES_DIR = join(__dirname, "..", "..", "..", "roles");

export interface RoleDefinition {
  name: string;
  slug: string;
  systemPrompt: string;
  boundaries: string;
  tools: string;
  description: string;
}

/**
 * All known role slugs.
 */
export const ALL_ROLE_SLUGS = [
  "project-manager",
  "tech-lead",
  "backend-developer",
  "frontend-developer",
  "qa-engineer",
  "devops-engineer",
  "dba",
  "security-analyst",
  "technical-writer",
] as const;

/**
 * Short alias map for convenience.
 */
export const ROLE_ALIASES: Record<string, string> = {
  pm: "project-manager",
  lead: "tech-lead",
  backend: "backend-developer",
  frontend: "frontend-developer",
  qa: "qa-engineer",
  devops: "devops-engineer",
  dba: "dba",
  security: "security-analyst",
  writer: "technical-writer",
  docs: "technical-writer",
};

/**
 * Human-readable descriptions for each role.
 */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  "project-manager": "Task creation, sprint planning, status tracking",
  "tech-lead": "Architecture decisions, code review, technical direction",
  "backend-developer": "APIs, services, server-side logic",
  "frontend-developer": "UI components, client-side logic, styling",
  "qa-engineer": "Testing, test plans, bug verification",
  "devops-engineer": "CI/CD, infrastructure, deployment",
  "dba": "Schema design, migrations, query optimization",
  "security-analyst": "Security audits, vulnerability assessment, compliance",
  "technical-writer": "Documentation, API docs, runbooks",
};

/**
 * Resolve a role name or alias to its canonical slug.
 */
export function resolveRole(input: string): string | null {
  const lower = input.trim().toLowerCase();
  if (ALL_ROLE_SLUGS.includes(lower as typeof ALL_ROLE_SLUGS[number])) {
    return lower;
  }
  return ROLE_ALIASES[lower] ?? null;
}

/**
 * Load a full role definition from the roles/ directory.
 */
export function loadRole(slug: string): RoleDefinition | null {
  const roleDir = join(ROLES_DIR, slug);
  if (!existsSync(roleDir)) {
    return null;
  }

  const readFile = (name: string): string => {
    const path = join(roleDir, name);
    return existsSync(path) ? readFileSync(path, "utf-8") : "";
  };

  const systemPrompt = readFile("system-prompt.md");

  // Extract first line of system prompt as description
  const firstLine = systemPrompt.split("\n").find((l) => l.trim() && !l.startsWith("#"));
  const description = firstLine?.trim() ?? ROLE_DESCRIPTIONS[slug] ?? "";

  return {
    name: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    slug,
    systemPrompt,
    boundaries: readFile("boundaries.md"),
    tools: readFile("tools.md"),
    description,
  };
}

/**
 * Load all roles.
 */
export function loadAllRoles(): RoleDefinition[] {
  return ALL_ROLE_SLUGS.map(loadRole).filter(Boolean) as RoleDefinition[];
}

/**
 * Get the base system prompt.
 */
export function loadBasePrompt(): string {
  const basePath = join(ROLES_DIR, "_base", "system-prompt.md");
  return existsSync(basePath) ? readFileSync(basePath, "utf-8") : "";
}

/**
 * Parse a comma-separated role string, resolving aliases.
 */
export function parseRoleList(input: string): string[] {
  if (input === "all") {
    return [...ALL_ROLE_SLUGS];
  }

  const roles: string[] = [];
  for (const part of input.split(",")) {
    const resolved = resolveRole(part);
    if (resolved) {
      roles.push(resolved);
    }
  }
  return roles;
}
