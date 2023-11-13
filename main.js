/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related to automation.
*/

import { propagationAttack, serverAnalysis } from "./tools/handles";
import { weaken } from "./network/hack";

/**
 * Main function to automate the game.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the script finishes.
 */
export async function main(ns) {
  await propagationAttack(ns);
  await serverAnalysis(ns);
}
