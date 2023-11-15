/*
  Brian van den Berg
  Module: BatchAnalysis
  File: main.js
  Description: This script checks and concludes Batch Analysis.
*/

import { readJSONFile, writeJSONFile } from "internal/json.js";

/**
 * Main function check and conclude the batch analysis.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 4) {
    throw new Error(
      `Expected program parameters: [inputFile, targetFile: string, hackPercentage, batchInterval: number]`
    );
  }

  // Fetch files to make conclusions on the data
  const batches = readJSONFile(ns, ns.args[0]);
  const targets = readJSONFile(ns, ns.args[1]);
  const hackPercentage = ns.args[2];
  const batchInterval = ns.args[3];

  batches.forEach((batch) => {
    const target = targets.find((target) => target.hostname === batch.hostname);

    // Calculate the execution window
    batch.executionWindow = batch.hackTime + batchInterval * 3;

    // Calculate the financial details
    batch.totalTime = batch.weakenTime + batchInterval * 2;
    batch.moneyPerSecond = (target.moneyMax * hackPercentage) / (batch.totalTime / 1000);
  });

  // Store the batch information
  writeJSONFile(ns, batches, ns.args[0]);
}
