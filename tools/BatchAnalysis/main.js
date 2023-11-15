/*
  Brian van den Berg
  Module: BatchAnalysis
  File: main.js
  Description: Orchestrates and finalizes Batch Analysis processes.
*/

import { readJSONFile, writeJSONFile } from "internal/json.js";
import { awaitScript } from "internal/process.js";

/**
 * Set up Batch Analysis by creating a list of target hostnames and saving it to a file.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} outputFile - File to save batches data.
 * @param {string} targetFile - File containing target hostnames.
 * @returns {void}
 */
function setupBatchAnalysis(ns, outputFile, targetFile) {
  // Generate list of target hostnames for hacking
  const targets = readJSONFile(ns, targetFile);
  const batches = targets
    .filter((target) => target.status === "hack")
    .map((target) => ({ hostname: target.hostname }));
  writeJSONFile(ns, batches, outputFile);
}

/**
 * Perform hack analysis on targets with the specified hack percentage.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} outputFile - File to save analysis results.
 * @param {string} targetFile - File containing target hostnames.
 * @param {number} hackPercentage - Percentage of hack to perform.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
async function hackBatchAnalysis(ns, outputFile, targetFile, hackPercentage) {
  // Start hack analysis process
  let pid = ns.exec(
    "tools/BatchAnalysis/hackAnalysis.js",
    ns.getHostname(),
    { preventDuplicates: true, temporary: false, threads: 1 },
    outputFile,
    targetFile,
    hackPercentage
  );

  // Ensure the process started successfully
  if (pid === 0) throw new Error(`Hack Analysis could not be started`);

  // Wait for the process to finish
  await awaitScript(ns, pid);
}

/**
 * Perform grow analysis on targets with the specified hack percentage.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} outputFile - File to save analysis results.
 * @param {string} targetFile - File containing target hostnames.
 * @param {number} hackPercentage - Percentage of hack to perform.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
async function growBatchAnalysis(ns, outputFile, targetFile, hackPercentage) {
  // Start grow analysis process
  let pid = ns.exec(
    "tools/BatchAnalysis/growAnalysis.js",
    ns.getHostname(),
    { preventDuplicates: true, temporary: false, threads: 1 },
    outputFile,
    targetFile,
    hackPercentage
  );

  // Ensure the process started successfully
  if (pid === 0) throw new Error(`Grow Analysis could not be started`);

  // Wait for the process to finish
  await awaitScript(ns, pid);
}

/**
 * Perform Batch Analysis, including setup, hack analysis, grow analysis, and conclusion.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} outputFile - File to save analysis results.
 * @param {string} targetFile - File containing target hostnames.
 * @param {number} hackPercentage - Percentage of hack to perform.
 * @param {number} batchInterval - Interval for batch analysis.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function performBatchAnalysis(
  ns,
  outputFile,
  targetFile,
  hackPercentage,
  batchInterval
) {
  // Perform Batch Analysis Setup
  setupBatchAnalysis(ns, outputFile, targetFile);

  // Perform Hack Batch Analysis
  await hackBatchAnalysis(ns, outputFile, targetFile, hackPercentage);

  // Perform Grow Batch Analysis
  await growBatchAnalysis(ns, outputFile, targetFile, hackPercentage);

  // Fetch files to make conclusions on the data
  const batches = readJSONFile(ns, outputFile);
  const targets = readJSONFile(ns, targetFile);

  // Calculate execution window and financial details for each batch
  batches.forEach((batch) => {
    const target = targets.find((target) => target.hostname === batch.hostname);

    batch.executionWindow = batch.hackTime + batchInterval * 3;
    batch.totalTime = batch.weakenTime + batchInterval * 2;
    batch.moneyPerSecond =
      (target.moneyMax * hackPercentage) / (batch.totalTime / 1000);
  });

  // Store batch information
  writeJSONFile(ns, batches, outputFile);
}

/**
 * Main function to check and conclude the batch analysis.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 4) {
    throw new Error(
      `Expected program parameters: [outputFile: string, targetFile: string, hackPercentage: number, batchInterval: number]`
    );
  }
  await performBatchAnalysis(
    ns,
    ns.args[0],
    ns.args[1],
    ns.args[2],
    ns.args[3]
  );
}
