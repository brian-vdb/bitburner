/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related to automation.
*/

import { BatchAnalysis, propagationAttack, serverAnalysis } from "./tools/handles";

/**
 * Main function to automate the game.
 *
 * Optional args:
 *   ns.args[0] - hack interval (default: 1000)
 *   ns.args[1] - max hack targets (default: 5)
 *
 * @param {import("./index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the script finishes.
 */
export async function main(ns) {
  // Extract optional arguments with default values
  const hackInterval = ns.args[0] !== undefined ? ns.args[0] : 1000;
  const maxHackTargets = ns.args[1] !== undefined ? ns.args[1] : 5;

  // Print initial status with the optional arguments used
  ns.tprint(`>>> | Starting main automation script with hackInterval=${hackInterval} and maxHackTargets=${maxHackTargets} | <<<`);

  // Perform a Propagation Attack
  ns.tprint(`>>> | Running: Propagation Attack | <<<`);
  await propagationAttack(ns);

  // Perform a Server Analysis
  ns.tprint(`>>> | Running: Server Analysis with maxHackTargets=${maxHackTargets} | <<<`);
  await serverAnalysis(ns, maxHackTargets);

  // Perform Batch Analysis with the optional arguments
  ns.tprint(`>>> | Running: Batch Analysis with hackInterval=${hackInterval} | <<<`);
  await BatchAnalysis(ns, hackInterval);
}
