/*
  Brian van den Berg
  Module: ExtractionOrchestratedHeal
  File: main.js
  Description: Tool to perform batch healing analysis and prepare execution data.
*/

import { readJSONFile, writeJSONFile } from "../../../../internal/json";
import { assignThreads } from "./allocation";
import { createBatches } from "./batch";

/**
 * Performs a heal-based batch analysis using provided hosts and targets.
 * Assigns threads, constructs batch plans, and writes updated targets and batch files.
 * 
 * Expected args:
 *   ns.args[0] - path to hosts JSON file
 *   ns.args[1] - path to targets JSON file
 *   ns.args[2] - optional hack interval (default: 1000)
 *
 * @param {import("../../../../index").NS} ns - The Bitburner environment object.
 * @returns {Promise<void>}
 */
export async function main(ns) {
  if (ns.args.length < 2) {
    throw new Error(`Expected program parameters: [hostsFile: string, targetsFile: string, hackInterval?: number]`);
  }

  const hosts = readJSONFile(ns, ns.args[0]);
  let targets = readJSONFile(ns, ns.args[1]);
  const hackInterval = ns.args[2] !== undefined ? ns.args[2] : 1000;

  targets = assignThreads(ns, hosts, targets);
  const batches = createBatches(ns, targets, hackInterval);

  writeJSONFile(ns, targets, "data/targets.txt");
  writeJSONFile(ns, batches, "data/batches.txt");
}
