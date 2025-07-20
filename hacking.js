import {
  hackingInfiltration,
  hackingAnalysis,
  extractionOrchestratedHeal,
  extractionOrchestratedPrepare,
  extractionOrchestratedExecution,
  extractionOrchestratedHack,
} from "./modules/handles";

/**
 * Prepares the network for hacking operations.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @param {number} [maxActionTime=1440] - Maximum time (in minutes) an action is allowed to take.
 * @returns {Promise<void>}
 */
async function prepareNetwork(ns, maxActionTime = 1440) {
  ns.tprint(" > Infecting the network...");
  await hackingInfiltration(ns);

  ns.tprint(" > Analyzing the servers...");
  await hackingAnalysis(ns, maxActionTime);
}

/**
 * Prepares and executes orchestrated batch execution.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @param {number} hackInterval - Interval between script executions.
 * @param {string} label - Label for logging (e.g., "heal" or "hack").
 * @returns {Promise<void>}
 */
async function runOrchestratedExecution(ns, hackInterval, label) {
  ns.tprint(` > Scheduling ${label} execution...`);
  await extractionOrchestratedPrepare(ns, hackInterval);

  ns.tprint(` > Executing ${label} batch...`);
  await extractionOrchestratedExecution(ns, hackInterval);
  await ns.sleep(1000);
}

/**
 * Main function to automate heal/hack batch cycles.
 *
 * Optional args:
 *   ns.args[0] - Hack percentage (default: 10)
 *   ns.args[1] - Hack interval (default: 1000)
 *   ns.args[2] - Max action time (default: 1440) in minutes
 *
 * @param {import("./index").NS} ns - The environment object.
 * @returns {Promise<void>}
 */
export async function main(ns) {
  const hackPercentage = ns.args[0] !== undefined ? ns.args[0] : 10;
  const hackInterval = ns.args[1] !== undefined ? ns.args[1] : 1000;
  const maxActionTime = ns.args[2] !== undefined ? ns.args[2] : 1440;

  ns.tprint(" Hacking Network:");

  while (true) {
    // HEAL CYCLE
    await prepareNetwork(ns, maxActionTime);

    ns.tprint(" > Creating heal batch...");
    await extractionOrchestratedHeal(ns, hackInterval);

    await runOrchestratedExecution(ns, hackInterval, "heal");

    // HACK CYCLE
    ns.tprint(" > Creating hack batch...");
    await extractionOrchestratedHack(ns, hackPercentage);

    await runOrchestratedExecution(ns, hackInterval, "hack");
  }
}
