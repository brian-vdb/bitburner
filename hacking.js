import {
  hackingInfiltration,
  hackingAnalysis,
  extractionOrchestratedHeal,
  extractionOrchestratedPrepare,
  extractionOrchestratedExecution,
  handleExtractionOrchestratedHack,
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
    await prepareNetwork(ns, maxActionTime);

    // HEAL CYCLE
    ns.tprint(" > Creating heal batch...");
    await extractionOrchestratedHeal(ns, hackInterval);

    ns.tprint(" > Scheduling heal execution...");
    await extractionOrchestratedPrepare(ns);

    ns.tprint(" > Executing heal batch...");
    await extractionOrchestratedExecution(ns, hackInterval);

    // HACK CYCLE
    ns.tprint(" > Creating hack batch...");
    await handleExtractionOrchestratedHack(ns, hackInterval, hackPercentage);

    ns.tprint(" > Scheduling hack execution...");
    await extractionOrchestratedPrepare(ns);

    ns.tprint(" > Executing hack batch...");
    await extractionOrchestratedExecution(ns, hackInterval);

    await ns.sleep(1000);
  }
}
