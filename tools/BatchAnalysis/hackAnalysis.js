/*
  Brian van den Berg
  Module: BatchAnalysis
  File: hackAnalysis.js
  Description: Handles hacking threads for Batch Analysis.
*/

import { readJSONFile, writeJSONFile } from "internal/json.js";

/**
 * Analyzes hack threads required for batches.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 3) {
    throw new Error(
      `Expected program parameters: [inputFile, targetFile: string, hackPercentage: number]`
    );
  }

  // Fetch files to start analyzing hacking threads for batches
  const batches = readJSONFile(ns, ns.args[0]);
  const targets = readJSONFile(ns, ns.args[1]);

  // Constants
  const weakenEffect = ns.weakenAnalyze(1);

  batches.forEach((batch) => {
    const target = targets.find((target) => target.hostname === batch.hostname);

    // Get the required time to hack
    batch.hackTime = ns.getHackTime(batch.hostname);

    // Calculate the amount of hack threads required
    batch.hackThreads = Math.round(
      ns.hackAnalyzeThreads(batch.hostname, target.moneyMax * ns.args[2])
    );

    // Get the required time to weaken
    batch.weakenTime = ns.getWeakenTime(batch.hostname);

    // Calculate the amount of weaken threads required after hacking
    batch.hackWeakenThreads = Math.ceil(
      ns.hackAnalyzeSecurity(batch.hackThreads, batch.hostname) / weakenEffect
    );
  });

  // Store batch information
  writeJSONFile(ns, batches, ns.args[0]);
}
