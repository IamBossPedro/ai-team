#!/usr/bin/env node

/**
 * @tcs-bpi/ai-team-cli
 *
 * Bootstrap AI team agent configs into any repository.
 *
 * Usage:
 *   npx @tcs-bpi/ai-team-cli init --roles backend,qa,tech-lead
 *   npx @tcs-bpi/ai-team-cli list
 *   npx @tcs-bpi/ai-team-cli add-role devops
 *   npx @tcs-bpi/ai-team-cli update
 */

import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { listCommand } from "./commands/list.js";
import { addRoleCommand } from "./commands/add-role.js";
import { updateCommand } from "./commands/update.js";

const program = new Command();

program
  .name("ai-team")
  .description("Bootstrap AI team agent configs into any repository")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize AI team configs in the current or target directory")
  .option("-r, --roles <roles>", "Comma-separated list of roles to include", "all")
  .option("-d, --dir <directory>", "Target directory", ".")
  .option("--skip-skills", "Skip copying skills", false)
  .option("--skip-hooks", "Skip copying hooks", false)
  .action(initCommand);

program
  .command("list")
  .description("List all available agent roles")
  .option("--json", "Output as JSON", false)
  .action(listCommand);

program
  .command("add-role <role>")
  .description("Add a role to an existing AI team configuration")
  .option("-d, --dir <directory>", "Target directory", ".")
  .action(addRoleCommand);

program
  .command("update")
  .description("Update AI team configs with latest role definitions")
  .option("-d, --dir <directory>", "Target directory", ".")
  .action(updateCommand);

program.parse();
