/**
 * add-role command — Add a role to an existing AI team configuration.
 *
 * Usage:
 *   ai-team add-role devops
 *   ai-team add-role security --dir /path/to/repo
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import chalk from "chalk";
import { resolveRole, loadRole, loadAllRoles } from "../utils/roles.js";
import { renderClaudeMd, renderAgentsMd } from "../utils/template.js";
import type { TemplateContext } from "../utils/template.js";
import type { RoleDefinition } from "../utils/roles.js";

interface AddRoleOptions {
  dir: string;
}

export async function addRoleCommand(
  roleName: string,
  options: AddRoleOptions
): Promise<void> {
  const targetDir = resolve(options.dir);
  const projectName = basename(targetDir);

  console.log(chalk.bold.blue("\n🤖 AI Team — Adding Role\n"));

  // Resolve the role
  const slug = resolveRole(roleName);
  if (!slug) {
    console.log(chalk.red(`  ❌ Unknown role: "${roleName}"`));
    console.log("  Run 'ai-team list' to see available roles.");
    process.exit(1);
  }

  const newRole = loadRole(slug);
  if (!newRole) {
    console.log(chalk.red(`  ❌ Could not load role definition: "${slug}"`));
    process.exit(1);
  }

  // Check for existing configs
  const claudeMdPath = join(targetDir, "CLAUDE.md");
  const agentsMdPath = join(targetDir, "AGENTS.md");

  if (!existsSync(claudeMdPath) || !existsSync(agentsMdPath)) {
    console.log(
      chalk.red("  ❌ No existing AI team config found. Run 'ai-team init' first.")
    );
    process.exit(1);
  }

  // Parse existing roles from AGENTS.md (look for role slugs in the file)
  const existingContent = readFileSync(agentsMdPath, "utf-8");
  const existingRoles: RoleDefinition[] = [];
  const allRoles = loadAllRoles();

  for (const role of allRoles) {
    if (existingContent.includes(role.slug)) {
      existingRoles.push(role);
    }
  }

  // Check if role already exists
  if (existingRoles.some((r) => r.slug === slug)) {
    console.log(chalk.yellow(`  ⚠️  Role "${newRole.name}" is already configured.`));
    return;
  }

  // Add the new role
  existingRoles.push(newRole);

  const context: TemplateContext = {
    projectName,
    repoPath: targetDir,
    roles: existingRoles,
  };

  // Regenerate configs
  writeFileSync(claudeMdPath, renderClaudeMd(context), "utf-8");
  writeFileSync(agentsMdPath, renderAgentsMd(context), "utf-8");

  console.log(`  ${chalk.green("✓")} Added role: ${chalk.cyan(newRole.name)}`);
  console.log(
    `  ${chalk.green("✓")} Updated ${chalk.cyan("CLAUDE.md")} and ${chalk.cyan("AGENTS.md")}`
  );
  console.log(
    `\n  Total roles: ${existingRoles.map((r) => chalk.green(r.name)).join(", ")}\n`
  );
}
