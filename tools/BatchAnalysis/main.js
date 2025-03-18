/*
  Brian van den Berg
  Module: BatchAnalysis
  File: main.js
  Description: Tool to perform batch analysis.
*/

import { readJSONFile, writeJSONFile } from "internal/json";
import { assignThreads } from "./allocation";

/**
 * Perform a batch analysis.
 * Executes a batch Analysis and stores results in data/batches.txt.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 1) {
    throw new Error(`Expected program parameters: [hostsFile: string, targetsFile: string]`);
  }

  // Setup data containers
  const hosts = readJSONFile(ns, ns.args[0]);
  let targets = readJSONFile(ns, ns.args[1]);

  // Allocate the threads to every target
  targets = assignThreads(ns, hosts, targets);

  // Store the result
  writeJSONFile(ns, targets, "data/targets.txt");
}
