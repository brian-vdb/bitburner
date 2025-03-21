/*
  Brian van den Berg
  Module: BatchAnalysis
  File: main.js
  Description: Tool to perform batch analysis.
*/

import { readJSONFile, writeJSONFile } from "internal/json";
import { assignThreads } from "./allocation";
import { populateBatch, prepareBatch } from "./batch";

/**
 * Perform a batch analysis.
 * Executes a batch analysis and stores results in data/targets.txt.
 *
 * Optional args:
 *   ns.args[2] - hack interval (default: 1000)
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 2) {
    throw new Error(`Expected program parameters: [hostsFile: string, targetsFile: string, hackInterval?: number]`);
  }

  // Setup data containers
  const hosts = readJSONFile(ns, ns.args[0]);
  let targets = readJSONFile(ns, ns.args[1]);

  // Extract optional parameters with default values if not provided
  const hackInterval = ns.args[2] !== undefined ? ns.args[2] : 1000;

  // Allocate the threads to every target using the optional parameters
  targets = assignThreads(ns, hosts, targets);

  // Prepare the batch according to the assigned threads
  let batch = prepareBatch(targets, hackInterval)
  batch = populateBatch(ns, targets, batch, hackInterval)

  // Store the result
  batch.events = batch.events.eventsArray
  writeJSONFile(ns, targets, "data/targets.txt");
  writeJSONFile(ns, batch, "data/batch.txt")
}
