/*
  Brian van den Berg
  Module: BatchAnalysis
  File: growAnalysis.js
  Description: This script handles growing threads in batch analysis.
*/

import { readJSONFile, writeJSONFile } from "internal/json.js";

/**
 * Main function to analyze required grow threads for batches.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 3) {
    throw new Error(
      `Expected program parameters: [inputFile, targetFile: string, hackPercentage: number]`
    );
  }

  // Fetch files to start analyzing growing threads for batches
  const batches = readJSONFile(ns, ns.args[0]);
  const targets = readJSONFile(ns, ns.args[1]);

  // Define constants
  const weakenEffect = ns.weakenAnalyze(1);

  batches.forEach((batch) => {
    const target = targets.find((target) => target.hostname === batch.hostname);

    // Get the required time to grow
    batch.growTime = ns.getGrowTime(batch.hostname);

    // Calculate the amount of grow threads required
    const multiplier =
      target.moneyMax / (target.moneyMax - target.moneyMax * ns.args[2]);
    batch.growThreads = Math.ceil(ns.growthAnalyze(batch.hostname, multiplier));

    // Calculate the amount of weaken threads required after growing
    batch.growWeakenThreads = Math.ceil(
      ns.growthAnalyzeSecurity(batch.growThreads, batch.hostname) / weakenEffect
    );
  });

  // Store the batch information
  writeJSONFile(ns, batches, ns.args[0]);
}
