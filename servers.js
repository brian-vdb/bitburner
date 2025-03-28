/*
   Brian van den Berg
   File: main.js
   Description: Automation script for buying/ upgrading/ preparing in-home servers.
*/

import { networkExpand, networkSync } from "./modules/handles";

/**
 * Main function to automate the process of maintaining servers.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the script finishes.
 */
export async function main(ns) {
  // Disable default logs.
  ns.disableLog("ALL");
  
  // open the tail.
  ns.ui.openTail();
  ns.ui.resizeTail(543, 100);

  // Perform network expansion.
  await networkExpand(ns);
  await networkSync(ns);
}
