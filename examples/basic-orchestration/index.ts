/**
 * Basic Orchestration Example
 *
 * Demonstrates routing a backend feature task through
 * Tech Lead (plan) → Backend Developer (implement) → QA Engineer (test)
 *
 * Usage:
 *   export ANTHROPIC_API_KEY=your-key
 *   npx tsx index.ts
 */

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// In a real consuming repo, you'd import from "@tcs-bpi/ai-team"
// Here we import directly from the source for demonstration
const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(__dirname, "../../packages/typescript/src");

const { Orchestrator } = await import(`${srcPath}/orchestrator.js`);
const { TechLead } = await import(`${srcPath}/roles/tech-lead.js`);
const { BackendDeveloper } = await import(`${srcPath}/roles/backend-developer.js`);
const { QAEngineer } = await import(`${srcPath}/roles/qa-engineer.js`);
const { TaskType, TaskStatus } = await import(`${srcPath}/types.js`);

async function main() {
  console.log("🤖 TCS-BPI AI Team — Basic Orchestration Example\n");

  // Create the orchestrator
  const orchestrator = new Orchestrator({
    onTaskComplete: (result: { agentRole: string; success: boolean }) => {
      console.log(`  ✅ ${result.agentRole} completed (success: ${result.success})`);
    },
    onHandoff: (handoff: { fromRole: string; toRole: string; reason: string }) => {
      console.log(`  🔄 Handoff: ${handoff.fromRole} → ${handoff.toRole} (${handoff.reason})`);
    },
    onError: (error: Error, task: { title: string }) => {
      console.error(`  ❌ Error on task "${task.title}":`, error.message);
    },
  });

  // Register agents
  const techLead = new TechLead();
  const backendDev = new BackendDeveloper();
  const qaEngineer = new QAEngineer();

  orchestrator.registerAgents([techLead, backendDev, qaEngineer]);

  console.log("Registered agents:", orchestrator.getRegisteredRoles());
  console.log();

  // Create a task
  const task = {
    id: "TASK-001",
    type: TaskType.BackendFeature,
    title: "Add user profile endpoint",
    description:
      "Create a GET /api/users/:id/profile endpoint that returns the user's " +
      "profile information including name, email, avatar URL, and account creation date. " +
      "The endpoint should return 404 if the user is not found.",
    status: TaskStatus.Created,
    priority: "medium" as const,
  };

  console.log(`📋 Submitting task: "${task.title}" (${task.type})\n`);
  console.log("Pipeline: Tech Lead (plan) → Backend Developer (implement) → QA Engineer (test)\n");

  // Submit task through the pipeline
  const results = await orchestrator.submitTask(task);

  console.log(`\n📊 Results: ${results.length} stage(s) completed\n`);

  for (const result of results) {
    console.log(`--- ${result.agentRole} ---`);
    console.log(result.output.slice(0, 300));
    console.log("...\n");
  }

  console.log(`Final task status: ${task.status}`);
}

main().catch(console.error);
