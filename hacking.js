/*
   Brian van den Berg
   File: hacking.js
   Description: Automation script for fully automated heal/ hack cycles on any server with more than 8GB of RAM.
*/

import { sleep } from "./internal/time";
import { batchCreateCycle, batchCreateHack, batchCreateHeal, batchExecution, networkSync, propagationAttack, serverAnalysis } from "./modules/handles";

/**
 * Prepares the server information for performing actions on the network.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @param {number} [maxActionTime=1440] - The maximum time an action is allowed to take.
 * @returns {Promise<void>} A promise that resolves when the server preparation is finished.
 */
async function prepareServers(ns, maxActionTime = 1440) {
  // Perform a propagation attack.
  ns.print(" > Infecting the network");
  await propagationAttack(ns);

  // Perform server analysis
  ns.print(" > Analyzing the servers");
  await serverAnalysis(ns, maxActionTime);
}

/**
 * Main function to automate heal/ hack cycles.
 *
 * Optional args:
 *   ns.args[0] - hack percentage (default: 10)
 *   ns.args[1] - hack interval (default: 1000)
 *   ns.args[2] - max action time (default: 1440) for weaken, grow, and hack operations.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that never resolves as it loops indefinitely.
 */
export async function main(ns) {
  // Disable default logs.
  ns.disableLog("ALL");

  // Check if "home-1" exists, and if it has more max RAM than the current host.
  if (
    ns.getHostname() !== "home-1" &&
    ns.serverExists("home-1") &&
    ns.getServerMaxRam("home-1") >= 16
  ) {
    await networkSync(ns);
    ns.exec(ns.getScriptName(), "home-1", 1, ...ns.args);
    return;
  }

  // Extract optional arguments with default values.
  const hackPercentage = ns.args[0] !== undefined ? ns.args[0] : 10;
  const hackInterval = ns.args[1] !== undefined ? ns.args[1] : 1000;
  const maxActionTime = ns.args[2] !== undefined ? ns.args[2] : 1440;

  while (true) {
    ns.clearLog();
    ns.print(" Hacking Status:");

    // Prepare the servers.
    await prepareServers(ns, maxActionTime);

    // Create a heal batch.
    ns.print(" > Creating heal batch");
    await batchCreateHeal(ns, hackInterval);

    // Perform the heal batch execution.
    ns.print(" > Executing heal batch");
    await batchExecution(ns, hackInterval);
    await sleep(1000);

    // Prepare the servers.
    await prepareServers(ns, maxActionTime);

    // Choose which batch analysis to run based on available RAM.
    if (ns.getServerMaxRam(ns.getHostname()) <= 8) {
      // Create a hack batch.
      ns.print(" > Creating hack batch");
      await batchCreateHack(ns, hackInterval, hackPercentage);
    } else {
      // Create a cycle batch.
      ns.print(" > Creating cycle batch");
      await batchCreateCycle(ns, hackInterval, hackPercentage);
    }

    // Perform the hack batch execution.
      ns.print(" > Executing hack batch");
      await batchExecution(ns, hackInterval);
      await sleep(1000);
  }
}
