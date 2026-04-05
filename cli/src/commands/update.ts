/**
 * update command — Regenerate AI team configs with latest role definitions.
 *
 * Usage:
 *   ai-team update
 *   ai-team update --dir /path/to/repo
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import chalk from "chalk";
import { loadAllRoles } from "../utils/roles.js";
import { renderClaudeMd, renderAgentsMd } from "../utils/template.js";
import type { TemplateContext } from "../utils/template.js";
import type { RoleDefinition } from "../utils/roles.js";

interface UpdateOptions {
  dir: string;
}

export async function updateCommand(options: UpdateOptions): Promise<void> {
  const targetDir = resolve(options.dir);
  const projectName = basename(targetDir);

  console.log(chalk.bold.blue("\n🤖 AI Team — Updating Configs\n"));

  const agentsMdPath = join(targetDir, "AGENTS.md");
  const claudeMdPath = join(targetDir, "CLAUDE.md");

  if (!existsSync(agentsMdPath)) {
    console.log(
      chalk.red("  ❌ No existing AI team config found. Run 'ai-team init' first.")
    );
    process.exit(1);
  }

  // Detect which roles are currently configured
  const existingContent = readFileSync(agentsMdPath, "utf-8");
  const allRoles = loadAllRoles();
  const configuredRoles: RoleDefinition[] = [];

  for (const role of allRoles) {
    if (existingContent.includes(role.slug)) {
      configuredRoles.push(role);
    }
  }

  if (configuredRoles.length === 0) {
    console.log(chalk.yellow("  ⚠️  No roles detected in existing config. Using all roles."));
    configuredRoles.push(...allRoles);
  }

  console.log(
    `  Detected roles: ${configuredRoles.map((r) => chalk.green(r.name)).join(", ")}\n`
  );

  const context: TemplateContext = {
    projectName,
    repoPath: targetDir,
    roles: configuredRoles,
  };

  // Regenerate
  writeFileSync(claudeMdPath, renderClaudeMd(context), "utf-8");
  console.log(`  ${chalk.green("✓")} Updated ${chalk.cyan("CLAUDE.md")}`);

  writeFileSync(agentsMdPath, renderAgentsMd(context), "utf-8");
  console.log(`  ${chalk.green("✓")} Updated ${chalk.cyan("AGENTS.md")}`);

  console.log(chalk.bold.green("\n✅ Configs updated with latest role definitions!\n"));
}
