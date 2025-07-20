import {
  hackingInfiltration,
  hackingAnalysis,
  extractionOrchestratedHeal,
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
  ns.tprint(" > Infecting the network...");
  await hackingInfiltration(ns);

  ns.tprint(" > Analyzing the servers...");
  await hackingAnalysis(ns, maxActionTime);
}

/**
 * Main function to automate heal/hack batch cycles.
 *
 * Optional args:
 *   ns.args[0] - Hack percentage (unused currently)
 *   ns.args[1] - Hack interval (default: 1000)
 *   ns.args[2] - Max action time (default: 1440) in minutes
 *
 * @param {import("./index").NS} ns - The environment object.
 * @returns {Promise<void>}
 */
export async function main(ns) {
  const hackInterval = ns.args[1] !== undefined ? ns.args[1] : 1000;
  const maxActionTime = ns.args[2] !== undefined ? ns.args[2] : 1440;

  ns.tprint(" Hacking Network:");

  while (true) {
    await prepareNetwork(ns, maxActionTime);

    ns.tprint(" > Creating heal batch...");
    await extractionOrchestratedHeal(ns, hackInterval);

    ns.tprint(" > Scheduling execution...");
    await extractionOrchestratedPrepare(ns);

    ns.tprint(" > Executing heal batch...");
    await extractionOrchestratedExecution(ns, hackInterval);

    await ns.sleep(1000);
  }
}
