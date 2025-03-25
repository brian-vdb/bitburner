/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related to automation,
                continuously looping to weaken/grow the servers.
*/

import { sleep } from "./internal/time";
import { maintainHomeNetwork, batchExecution, propagationAttack, serverAnalysis, batchCreateHeal, batchCreateHack } from "./modules/handles";

/**
 * Prepares the server information for performing actions on the network
 *
 * @param {import("./index").NS} ns - The environment object
 * @param {number} [maxHackTargets=5] - Maximum number of hack targets
 * @returns {Promise<void>} A promise that never resolves as it loops indefinitely
 */
async function prepareServers(ns, maxHackTargets) {
  // Perform a Propagation Attack
  ns.tprint(`>>> | Running: Propagation Attack | <<<`);
  await propagationAttack(ns);

  // Perform a Server Analysis
  ns.tprint(`>>> | Running: Server Analysis with maxHackTargets=${maxHackTargets} | <<<`);
  await serverAnalysis(ns, maxHackTargets);
}

/**
 * Main function to automate the game in an infinite loop
 *
 * Optional args:
 *   ns.args[0] - max hack targets (default: 5)
 *   ns.args[1] - max action time (default: undefined) for weaken, grow, and hack operations.
 *   ns.args[2] - hack percentage (default: 10)
 *   ns.args[3] - hack interval (default: 1000)
 *
 * @param {import("./index").NS} ns - The environment object
 * @returns {Promise<void>} A promise that never resolves as it loops indefinitely
 */
export async function main(ns) {
  // Extract optional arguments with default values
  const maxHackTargets = ns.args[0] !== undefined ? ns.args[0] : 5;
  const maxActionTime = ns.args[1] !== undefined ? ns.args[1] : undefined;
  const hackPercentage = ns.args[2] !== undefined ? ns.args[2] : 10;
  const hackInterval = ns.args[3] !== undefined ? ns.args[3] : 1000;

  while (true) {
    ns.tprint(`>>> | Starting automation iteration with maxHackTargets=${maxHackTargets}, maxActionTime=${maxActionTime}, hackPercentage=${hackPercentage} and hackInterval=${hackInterval}| <<<`);

    // Maintain the Home Network
    ns.tprint(`>>> | Running: Maintain Home Network | <<<`);
    await maintainHomeNetwork(ns);

    // Prepare the servers
    await prepareServers(ns, maxHackTargets);

    // Check available RAM on the home server
    const homeMaxRam = ns.getServerMaxRam('home');
    ns.tprint(`>>> | homeMaxRam=${homeMaxRam}GB | <<<`);

    // Choose which batch analysis to run based on available RAM
    if (homeMaxRam <= 8) {
      // Create a heal batch
      ns.tprint(`>>> | Running: Batch Create Heal with hackInterval=${hackInterval} | <<<`);
      await batchCreateHeal(ns, hackInterval);

      // Perform Batch Execution
      ns.tprint(`>>> | Running: Batch Execution | <<<`);
      await batchExecution(ns);

      // Give time to recover from async issues
      ns.tprint(`>>> | Continuing in ${hackInterval}ms... | <<<`);
      await sleep(hackInterval);

      // Prepare the servers
      await prepareServers(ns, maxHackTargets);

      // Create a hack batch
      ns.tprint(`>>> | Running: Batch Create Hack with hackPercentage=${hackPercentage} | <<<`);
      await batchCreateHack(ns, hackPercentage);
    } else {
      ns.tprint(`>>> | Running: Batch Analysis Full with hackInterval=${hackInterval} | <<<`);
      // TODO: Implement batchAnalysis when available
    }

    // Perform Batch Execution
    ns.tprint(`>>> | Running: Batch Execution | <<<`);
    await batchExecution(ns);

    // Give time to recover from async issues
    ns.tprint(`>>> | Iteration complete. Restarting loop in ${hackInterval}ms... | <<<`);
    await sleep(hackInterval);
  }
}
