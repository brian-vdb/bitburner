/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related to automation.
*/

import { propagationAttack, serverAnalysis } from "./tools/handles";

/**
 * Main function to automate the game.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the script finishes.
 */
export async function main(ns) {
  ns.tprint(`>>>\n| Running: Propagation Attack |`);
  await propagationAttack(ns);

  let inputFile = "data/servers.txt";
  ns.tprint(`>>>\n| Running: Server Analysis [${inputFile}] |`);
  await serverAnalysis(ns, inputFile);
}
