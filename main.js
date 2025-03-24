/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related to automation,
                continuously looping to weaken/grow the servers.
*/

import { sleep } from "./internal/time";
import { maintainHomeNetwork, BatchAnalysis, BatchExecution, propagationAttack, serverAnalysis } from "./modules/handles";

/**
 * Main function to automate the game in an infinite loop.
 *
 * Optional args:
 *   ns.args[0] - hack interval (default: 1000)
 *   ns.args[1] - max hack targets (default: 5)
 *   ns.args[2] - max action time (default: undefined) for weaken, grow, and hack operations.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that never resolves as it loops indefinitely.
 */
export async function main(ns) {
  // Extract optional arguments with default values
  const hackInterval = ns.args[0] !== undefined ? ns.args[0] : 1000;
  const maxHackTargets = ns.args[1] !== undefined ? ns.args[1] : 5;
  const maxActionTime = ns.args[2] !== undefined ? ns.args[2] : undefined;

  while (true) {
    ns.tprint(`>>> | Starting automation iteration with hackInterval=${hackInterval}, maxHackTargets=${maxHackTargets} and maxActionTime=${maxActionTime} | <<<`);

    // Maintain the Home Network
    ns.tprint(`>>> | Running: Maintain Home Network | <<<`);
    await maintainHomeNetwork(ns);

    // Perform a Propagation Attack
    ns.tprint(`>>> | Running: Propagation Attack | <<<`);
    await propagationAttack(ns);

    // Perform a Server Analysis
    ns.tprint(`>>> | Running: Server Analysis with maxHackTargets=${maxHackTargets} | <<<`);
    await serverAnalysis(ns, maxHackTargets);

    // Perform Batch Analysis
    ns.tprint(`>>> | Running: Batch Analysis with hackInterval=${hackInterval} | <<<`);
    await BatchAnalysis(ns, hackInterval);

    // Perform Batch Execution
    ns.tprint(`>>> | Running: Batch Execution | <<<`);
    await BatchExecution(ns);

    ns.tprint(`>>> | Iteration complete. Restarting loop in ${hackInterval * 4}ms... | <<<`);
    await sleep(hackInterval * 4);
  }
}
