/*
   Brian van den Berg
   File: hacking.js
   Description: Automation script for fully automated heal/ hack cycles on any server with more than 8GB of RAM.
*/

import { sleep } from "../internal/time";
import { batchCreateHack, batchCreateHeal, batchExecution, propagationAttack, serverAnalysis } from "../modules/handles";

/**
 * Prints a status to the log.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} - Status to print on the screen.
 * @returns {void} A promise that resolves when the server preperation is finished.
 */
function printStatus(ns, status) {
  // Clear the log and print the status
  ns.clearLog();
  ns.print("  Hacking Status:");
  ns.print(`  ${status}`);
  ns.print(" ");
}

/**
 * Prepares the server information for performing actions on the network.
 *
 * @param {import("../index").NS} ns - The environment object
 * @param {number} [maxActionTime=1440] - The maximum time an action is allowed to take
 * @returns {Promise<void>} A promise that resolves when the server preperation is finished
 */
async function prepareServers(ns, maxActionTime=1440) {
  // Perform a propagation attack.
  printStatus(ns, `- Infecting the network`);
  await propagationAttack(ns);

  // Perform server analysis
  printStatus(ns, `- Analyzing the servers`);
  await serverAnalysis(ns, maxActionTime);
}

/**
 * Main function to automate heal/ hack cycles.
 *
 * Optional args:
 *   ns.args[0] - hack percentage (default: 10)
 *   ns.args[1] - hack interval (default: 1000)
 *   ns.args[2] - max hack targets (default: 5)
 *   ns.args[3] - max action time (default: undefined) for weaken, grow, and hack operations.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that never resolves as it loops indefinitely.
 */
export async function main(ns) {
  // Extract optional arguments with default values
  const hackPercentage = ns.args[0] !== undefined ? ns.args[0] : 10;
  const hackInterval = ns.args[1] !== undefined ? ns.args[1] : 1000;
  const maxActionTime = ns.args[2] !== undefined ? ns.args[2] : 1440;

  // Open a tail log
  ns.disableLog("ALL");

  while (true) {
    // Prepare the servers.
    await prepareServers(ns, hackInterval, maxActionTime);

    // Create a heal batch.
    printStatus(ns, `- Creating heal batch`);
    await batchCreateHeal(ns, hackInterval);

    // Perform the heal batch execution.
    printStatus(ns, `- Executing heal batch`);
    await batchExecution(ns, hackInterval, 'Heal Batch');
    await sleep(hackInterval);

    // Prepare the servers.
    await prepareServers(ns, hackInterval, maxActionTime);

    // Choose which batch analysis to run based on available RAM
    if (ns.getServerMaxRam(ns.getHostname()) <= 8) {
      // Create a hack batch.
      printStatus(ns, `- Creating hack batch`);
      await batchCreateHack(ns, hackInterval, hackPercentage);
    } else {
      // TODO: Implement batchAnalysis when available
    }

    // Perform the hack batch execution.
    printStatus(ns, `- Executing hack batch`);
    await batchExecution(ns, hackInterval, 'Hack Batch');
    await sleep(hackInterval);
  }
}
