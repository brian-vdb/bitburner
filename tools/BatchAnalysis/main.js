/*
  Brian van den Berg
  Module: BatchAnalysis
  File: main.js
  Description: This module contains functions related to collecting information about batches.
*/

import { readJSONFile } from "internal/json.js";

/**
 * Main function to perform a batch analysis.
 * Start a batch analysis using data/targets.txt.
 * The result gets stored in batches.txt.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 1) {
    throw new Error(`Expected program parameters: [inputFile]`);
  }

  // Setup data containers
  const targets = readJSONFile(ns, ns.args[0]);
  const batches = [];

  // Debugging Line
  ns.tprint(targets);
}
