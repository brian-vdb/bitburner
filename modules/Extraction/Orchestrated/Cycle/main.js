/*
  Brian van den Berg
  Module: ExtractionOrchestratedCycle
  File: main.js
  Description: Tool to perform HWGW cycle batch planning for hack operations.
*/

import { readJSONFile, writeJSONFile } from "../../../../internal/json";
import { assignThreads } from "./allocation";
import { createBatches, scaleBatchCounts } from "./batch";

/**
 * Orchestrates a cycle-based batch analysis using HWGW pattern.
 * Allocates threads, constructs execution batches, and writes result files.
 * 
 * Expected args:
 *   ns.args[0] - path to hosts JSON file
 *   ns.args[1] - path to targets JSON file
 *   ns.args[2] - optional hack interval (default: 1000)
 *   ns.args[3] - optional hack percentage (default: 10)
 *
 * @param {import("../../../../index").NS} ns - The Bitburner environment object.
 * @returns {Promise<void>}
 */
export async function main(ns) {
  if (ns.args.length < 2) {
    throw new Error(`Expected parameters: [hostsFile: string, targetsFile: string, hackInterval?: number, hackPercentage?: number]`);
  }

  const hosts = readJSONFile(ns, ns.args[0]);
  let targets = readJSONFile(ns, ns.args[1]);

  const hackInterval = ns.args[2] !== undefined ? ns.args[2] : 1000;
  const hackPercentage = ns.args[3] !== undefined ? ns.args[3] : 10;

  const assignment = assignThreads(ns, hosts, targets, hackPercentage);
  targets = assignment.targets;

  const batches = scaleBatchCounts(
    targets,
    createBatches(ns, targets, hackInterval, hackPercentage),
    assignment.hosts,
    hackInterval
  );

  writeJSONFile(ns, targets, "data/targets.txt");
  writeJSONFile(ns, batches, "data/batches.txt");
  writeJSONFile(ns, assignment.hosts, "data/hosts.txt");
}
