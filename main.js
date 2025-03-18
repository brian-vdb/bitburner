/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related to automation.
*/

import { BatchAnalysis, propagationAttack, serverAnalysis } from "./tools/handles";

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

  ns.tprint(`>>> | Running: Batch Analysis | <<<`)
  await BatchAnalysis(ns);
}
