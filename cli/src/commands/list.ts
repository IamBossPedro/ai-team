/**
 * list command — Show all available agent roles.
 *
 * Usage:
 *   ai-team list
 *   ai-team list --json
 */

import chalk from "chalk";
import { ALL_ROLE_SLUGS, ROLE_ALIASES, ROLE_DESCRIPTIONS, loadRole } from "../utils/roles.js";

interface ListOptions {
  json: boolean;
}

export async function listCommand(options: ListOptions): Promise<void> {
  if (options.json) {
    const roles = ALL_ROLE_SLUGS.map((slug) => ({
      slug,
      name: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      description: ROLE_DESCRIPTIONS[slug],
      aliases: Object.entries(ROLE_ALIASES)
        .filter(([, v]) => v === slug)
        .map(([k]) => k),
    }));
    console.log(JSON.stringify(roles, null, 2));
    return;
  }

  console.log(chalk.bold.blue("\n🤖 AI Team — Available Roles\n"));

  const maxSlugLen = Math.max(...ALL_ROLE_SLUGS.map((s) => s.length));

  for (const slug of ALL_ROLE_SLUGS) {
    const desc = ROLE_DESCRIPTIONS[slug] ?? "";
    const aliases = Object.entries(ROLE_ALIASES)
      .filter(([, v]) => v === slug)
      .map(([k]) => k);

    const aliasStr = aliases.length > 0 ? chalk.gray(` (aliases: ${aliases.join(", ")})`) : "";

    console.log(
      `  ${chalk.green(slug.padEnd(maxSlugLen))}  ${desc}${aliasStr}`
    );
  }

  console.log(
    `\n  ${chalk.gray("Use")} ${chalk.cyan("ai-team init --roles <role1>,<role2>")} ${chalk.gray("to initialize")}\n`
  );
}
