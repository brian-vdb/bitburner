/*
  Brian van den Berg
  Module: BatchCreateCycle
  File: main.js
  Description: Tool to perform batch analysis for cycle hacking.
*/

import { readJSONFile, writeJSONFile } from "../../internal/json";
import { assignThreads } from "./allocation";
import { createBatches, scaleBatchAmounts } from "./batch";
import { normalizeBatches } from "../../internal/batch";

/**
 * Perform a batch analysis for cycle hacking the best target.
 * Executes a batch analysis and stores results in data/targets.txt.
 *
 * Optional args:
 *   ns.args[2] - hack interval (default: 1000)
 *   ns.args[3] - hack percentage (default: 10)
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 2) {
    throw new Error(`Expected program parameters: [hostsFile: string, targetsFile: string, hackInterval?: number, hackPercentage?: number]`);
  }

  // Setup data containers
  const hosts = readJSONFile(ns, ns.args[0]);
  let targets = readJSONFile(ns, ns.args[1]);

  // Extract optional parameters with default values if not provided.
  const hackInterval = ns.args[2] !== undefined ? ns.args[2] : 1000;
  const hackPercentage = ns.args[3] !== undefined ? ns.args[3] : 10;

  // Allocate the threads to every target using the optional parameters.
  targets = assignThreads(ns, hosts, targets, hackPercentage, hosts.length);

  // Prepare the batch according to the assigned threads.
  let batches = createBatches(ns, targets, hackInterval, hackPercentage);
  batches = normalizeBatches(batches);
  batches = scaleBatchAmounts(targets, batches, hosts);

  // Store the result.
  writeJSONFile(ns, targets, "data/targets.txt");
  writeJSONFile(ns, batches, "data/batches.txt");
}
