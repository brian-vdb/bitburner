/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related to automation.
*/

import { propagationAttack, serverAnalysis, batchAnalysis } from "./tools/handles";

/**
 * Main function to automate the game.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the script finishes.
 */
export async function main(ns) {
  // Perform a Propagation Attack
  ns.tprint(`>>> | Running: Propagation Attack | <<<`);
  await propagationAttack(ns);

  // Perform a Server Analysis
  ns.tprint(`>>> | Running: Server Analysis | <<<`);
  await serverAnalysis(ns);

  // Perform a Batch Analysis // TODO: Pass parameters from args
  ns.tprint(`>>> | Running: Batch Analysis | <<<`);
  await batchAnalysis(ns, 0.01, 1);
}
