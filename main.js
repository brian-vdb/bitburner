/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related to automation,
                continuously looping to weaken/grow the servers.
*/

import { sleep } from "./internal/time";
import { batchExecution, propagationAttack, serverAnalysis, batchCreateHeal, batchCreateHack, networkExpand, networkSync } from "./modules/handles";

/**
 * Maintains the network of in-home servers
 *
 * @param {import("./index").NS} ns - The environment object
 * @returns {Promise<void>} A promise that never resolves as it loops indefinitely
 */
async function maintainNetwork(ns) {
  // Expand the Home Network
  ns.tprint(`>>> | Running: Network Expand | <<<`);
  await networkExpand(ns);

  // Sync the Home Network
  ns.tprint(`>>> | Running: Network Sync | <<<`);
  await networkSync(ns);
}

/**
 * Prepares the server information for performing actions on the network
 *
 * @param {import("./index").NS} ns - The environment object
 * @param {number} [maxActionTime=1440] - The maximum time an action is allowed to take
 * @returns {Promise<void>} A promise that never resolves as it loops indefinitely
 */
async function prepareServers(ns, maxActionTime=1440) {
  // Perform a Propagation Attack
  ns.tprint(`>>> | Running: Propagation Attack | <<<`);
  await propagationAttack(ns);

  // Perform a Server Analysis
  ns.tprint(`>>> | Running: Server Analysis with maxActionTime=${maxActionTime} | <<<`);
  await serverAnalysis(ns, maxActionTime);
}

/**
 * Main function to automate the game in an infinite loop
 *
 * Optional args:
 *   ns.args[0] - hack percentage (default: 10)
 *   ns.args[1] - hack interval (default: 1000)
 *   ns.args[2] - max hack targets (default: 5)
 *   ns.args[3] - max action time (default: undefined) for weaken, grow, and hack operations.
 *
 * @param {import("./index").NS} ns - The environment object
 * @returns {Promise<void>} A promise that never resolves as it loops indefinitely
 */
export async function main(ns) {
  // Extract optional arguments with default values
  const hackPercentage = ns.args[0] !== undefined ? ns.args[0] : 10;
  const hackInterval = ns.args[1] !== undefined ? ns.args[1] : 1000;
  const maxHackTargets = ns.args[2] !== undefined ? ns.args[2] : 5;
  const maxActionTime = ns.args[3] !== undefined ? ns.args[3] : 1440;

  while (true) {
    ns.tprint(`>>> | Starting automation iteration with maxHackTargets=${maxHackTargets}, maxActionTime=${maxActionTime}, hackPercentage=${hackPercentage} and hackInterval=${hackInterval}| <<<`);

    // Maintains the in-home servers
    await maintainNetwork(ns);

    // Prepare the servers
    await prepareServers(ns, maxActionTime);

    // Check available RAM on the home server
    const hostMaxRam = ns.getServerMaxRam(ns.getHostname());
    ns.tprint(`>>> | hostMaxRam=${hostMaxRam}GB | <<<`);

    // Choose which batch analysis to run based on available RAM
    if (hostMaxRam <= 8) {
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
      await prepareServers(ns, maxActionTime);

      // Create a hack batch
      ns.tprint(`>>> | Running: Batch Create Hack with maxHackTargets=${maxHackTargets} and hackPercentage=${hackPercentage} | <<<`);
      await batchCreateHack(ns, maxHackTargets, hackPercentage);
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
