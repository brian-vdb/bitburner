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
  if (ns.args.length < 2) {
    throw new Error("Expected args: [Input File] [Output File]");
  }
  const servers = readJSONFile(ns, ns.args[0]);
  ns.tprint(servers);
}
