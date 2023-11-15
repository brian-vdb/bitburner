/*
  Brian van den Berg
  Module: BatchAnalysis
  File: hackAnalysis.js
  Description: This script handles hacking threads in batch analysis.
*/

import { readJSONFile } from "internal/json.js";

/**
 * Main function to analyze required hack threads for batches.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 1) {
    throw new Error(`Expected program parameters: [inputFile]`);
  }

  // Setup data containers
  const batches = readJSONFile(ns, ns.args[0]);

  batches.forEach(batch => {
    // Calculate the amount of hack threads required
    batch.hackThreads = ns.hackAnalyzeThreads(batch.hostname, 1000);
  });

  // Debugging Line
  ns.tprint(batches);
}
