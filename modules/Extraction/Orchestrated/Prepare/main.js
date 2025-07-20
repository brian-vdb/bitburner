/*
  Brian van den Berg
  Module: ExtractionOrchestratedPrepare
  File: main.js
  Description: Augments batches with scheduling and execution metadata using synchronized timing.
*/

import { readJSONFile, writeJSONFile } from "../../../../internal/json";
import { computeSchedulingWindows, normalizeExecutionTimes } from "./timing";

/**
 * Adds synchronized timing metadata to all batches.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object
 * @returns {Promise<void>}
 */
export async function main(ns) {
  if (ns.args.length < 1) {
    throw new Error("Expected program parameters: [batchesFile: string]");
  }

  const file = ns.args[0];
  const batches = readJSONFile(ns, file);
  const hackInterval = 1000;

  // Compute scheduling windows
  const schedulingData = computeSchedulingWindows(batches, hackInterval);

  // Normalize thread timings and metadata
  normalizeExecutionTimes(batches, schedulingData);

  // Write updated file
  writeJSONFile(ns, batches, file);
}
