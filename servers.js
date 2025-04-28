/*
   Brian van den Berg
   File: main.js
   Description: Automation script for buying/ upgrading/ preparing in-home servers.
*/

import { networkExpand, networkSync, propagationAttack, serverAnalysis } from "./modules/handles";

/**
 * Prepares the server information for performing actions on the network.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the server preparation is finished.
 */
async function prepareServers(ns) {
  // Perform a propagation attack.
  await propagationAttack(ns);

  // Perform server analysis
  await serverAnalysis(ns);
}

/**
 * Main function to automate the process of maintaining servers.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the script finishes.
 */
export async function main(ns) {
  // Disable default logs.
  ns.disableLog("ALL");

  // Perform network expansion.
  await networkExpand(ns);
  await networkSync(ns);

  // Prepare the servers.
  await prepareServers(ns);
}
