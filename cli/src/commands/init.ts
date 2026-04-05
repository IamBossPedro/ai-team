/**
 * init command — Bootstrap AI team configs into a target directory.
 *
 * Usage:
 *   ai-team init --roles backend,qa,tech-lead
 *   ai-team init --roles all --dir /path/to/repo
 */

import { writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, basename, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { parseRoleList, loadRole, loadAllRoles } from "../utils/roles.js";
import { renderClaudeMd, renderAgentsMd } from "../utils/template.js";
import type { TemplateContext } from "../utils/template.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, "..", "..", "..", "claude-code", "skills");
const HOOKS_DIR = join(__dirname, "..", "..", "..", "claude-code", "hooks");
const SETTINGS_DIR = join(__dirname, "..", "..", "..", "claude-code", "settings");

interface InitOptions {
  roles: string;
  dir: string;
  skipSkills: boolean;
  skipHooks: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const targetDir = resolve(options.dir);
  const projectName = basename(targetDir);

  console.log(chalk.bold.blue("\n🤖 AI Team — Initializing\n"));
  console.log(`  Target: ${chalk.cyan(targetDir)}`);

  // Resolve roles
  const roleSlugs = parseRoleList(options.roles);
  if (roleSlugs.length === 0) {
    console.log(chalk.red("  ❌ No valid roles specified."));
    console.log('  Use --roles with comma-separated values (e.g., "backend,qa,tech-lead")');
    process.exit(1);
  }

  const roles = roleSlugs.map(loadRole).filter(Boolean) as NonNullable<
    ReturnType<typeof loadRole>
  >[];

  console.log(
    `  Roles:  ${roles.map((r) => chalk.green(r.name)).join(", ")}\n`
  );

  // Build template context
  const context: TemplateContext = {
    projectName,
    repoPath: targetDir,
    roles,
  };

  // Generate CLAUDE.md
  const claudeMd = renderClaudeMd(context);
  const claudeMdPath = join(targetDir, "CLAUDE.md");
  writeFileSync(claudeMdPath, claudeMd, "utf-8");
  console.log(`  ${chalk.green("✓")} Created ${chalk.cyan("CLAUDE.md")}`);

  // Generate AGENTS.md
  const agentsMd = renderAgentsMd(context);
  const agentsMdPath = join(targetDir, "AGENTS.md");
  writeFileSync(agentsMdPath, agentsMd, "utf-8");
  console.log(`  ${chalk.green("✓")} Created ${chalk.cyan("AGENTS.md")}`);

  // Copy skills
  if (!options.skipSkills && existsSync(SKILLS_DIR)) {
    const skillsTarget = join(targetDir, ".claude", "skills");
    mkdirSync(skillsTarget, { recursive: true });

    const skillDirs = [
      "code-review",
      "security-audit",
      "db-migration",
      "write-docs",
      "plan-sprint",
      "run-tests",
    ];

    for (const skill of skillDirs) {
      const src = join(SKILLS_DIR, skill, "SKILL.md");
      if (existsSync(src)) {
        const dest = join(skillsTarget, skill);
        mkdirSync(dest, { recursive: true });
        copyFileSync(src, join(dest, "SKILL.md"));
        console.log(`  ${chalk.green("✓")} Copied skill: ${chalk.cyan(skill)}`);
      }
    }
  }

  // Copy hooks
  if (!options.skipHooks && existsSync(HOOKS_DIR)) {
    const hooksTarget = join(targetDir, ".claude", "hooks");
    mkdirSync(hooksTarget, { recursive: true });

    const hooks = ["pre-commit-review.sh", "pre-tool-guard.sh"];
    for (const hook of hooks) {
      const src = join(HOOKS_DIR, hook);
      if (existsSync(src)) {
        copyFileSync(src, join(hooksTarget, hook));
        console.log(`  ${chalk.green("✓")} Copied hook: ${chalk.cyan(hook)}`);
      }
    }
  }

  // Copy settings
  if (existsSync(SETTINGS_DIR)) {
    const settingsTarget = join(targetDir, ".claude", "settings");
    mkdirSync(settingsTarget, { recursive: true });

    const settings = ["base.json", "strict.json", "full-access.json"];
    for (const setting of settings) {
      const src = join(SETTINGS_DIR, setting);
      if (existsSync(src)) {
        copyFileSync(src, join(settingsTarget, setting));
      }
    }
    console.log(`  ${chalk.green("✓")} Copied settings presets`);
  }

  console.log(chalk.bold.green("\n✅ AI Team initialized successfully!\n"));
  console.log("  Next steps:");
  console.log(`  1. Review ${chalk.cyan("CLAUDE.md")} and ${chalk.cyan("AGENTS.md")}`);
  console.log("  2. Customize roles and boundaries as needed");
  console.log(`  3. Open ${chalk.cyan("Claude Code")} in your repo to use the agents\n`);
}
