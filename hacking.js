import {
  hackingInfiltration,
  hackingAnalysis,
  extractionOrchestratedHeal,
  extractionOrchestratedCycle,
  extractionOrchestratedHack,
  extractionOrchestratedPrepare,
  extractionOrchestratedExecution,
} from "./modules/handles";

/**
 * Prepares the network for hacking operations.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @param {number} [maxActionTime=1440] - Maximum time (in minutes) an action is allowed to take.
 * @returns {Promise<void>}
 */
async function prepareNetwork(ns, maxActionTime = 1440) {
  ns.print(" > Infecting the network...");
  await hackingInfiltration(ns);

  ns.print(" > Analyzing the servers...");
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
  ns.print(` > Scheduling ${label} execution...`);
  await extractionOrchestratedPrepare(ns, hackInterval);

  ns.print(` > Executing ${label} batch...`);
  await extractionOrchestratedExecution(ns, hackInterval);

  ns.print(` > Finished ${label} batch...`);
  await ns.sleep(3 * hackInterval);
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
  ns.disableLog("ALL");

  const hackPercentage = ns.args[0] !== undefined ? ns.args[0] : 10;
  const hackInterval = ns.args[1] !== undefined ? ns.args[1] : 1000;
  const maxActionTime = ns.args[2] !== undefined ? ns.args[2] : 1440;

  while (true) {
    ns.clearLog();
    
    // HEAL CYCLE
    ns.print(" Healing Network:");

    await prepareNetwork(ns, maxActionTime);

    ns.print(" > Creating heal batch...");
    await extractionOrchestratedHeal(ns, hackInterval);

    await runOrchestratedExecution(ns, hackInterval, "heal");

    // HACK CYCLE
    ns.print("\n Hacking Network:");

    await prepareNetwork(ns, maxActionTime);

    const hostMaxRam = ns.getServerMaxRam(ns.getHostname());
    if (hostMaxRam <= 8) {
      ns.print(" > Low RAM host: using Hack strategy...");
      await extractionOrchestratedHack(ns, hackPercentage);
    } else {
      ns.print(" > High RAM host: using Cycle strategy...");
      await extractionOrchestratedCycle(ns, hackInterval, hackPercentage);
    }

    await runOrchestratedExecution(ns, hackInterval, "hack");
  }
}
