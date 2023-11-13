/*
   Brian van den Berg
   Module: ServerAnalysis
   File: main.js
   Description: This module contains functions related to collecting information about servers
*/

import { readJSONFile } from "./internal/json";

/**
 * Main function to perform a server analysis.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the analysis is complete.
 */
export async function main(ns) {
  const servers = readJSONFile(ns, "data/servers.txt");
  ns.tprint(servers);
}
