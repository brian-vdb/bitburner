/*
  Brian van den Berg
  Module: BatchCreateHack
  File: main.js
  Description: Tool to perform batch analysis.
*/

import { readJSONFile, writeJSONFile } from "internal/json";
import { assignThreads } from "./allocation";
import { populateBatch, prepareBatch } from "./batch";

/**
 * Perform a batch analysis purely for hacking a percentage of money from hacking targets.
 * Executes a batch analysis and stores results in data/targets.txt.
 *
 * Optional args:
 *   ns.args[2] - hack percentage (default: 10)
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 2) {
    throw new Error(`Expected program parameters: [hostsFile: string, targetsFile: string, hackPercentage?: number]`);
  }

  // Setup data containers
  const hosts = readJSONFile(ns, ns.args[0]);
  let targets = readJSONFile(ns, ns.args[1]);

  // Extract optional parameters with default values if not provided
  const maxHackTargets = ns.args[2] !== undefined ? ns.args[2] : 5;
  const hackPercentage = ns.args[3] !== undefined ? ns.args[3] : 10;

  // Allocate the threads to every target using the optional parameters
  targets = assignThreads(ns, hosts, targets, maxHackTargets, hackPercentage);

  // Prepare the batch according to the assigned threads
  let batch = prepareBatch(targets)
  batch = populateBatch(ns, targets, batch, hackPercentage)

  // Store the result
  batch.events = batch.events.eventsArray
  writeJSONFile(ns, targets, "data/targets.txt");
  writeJSONFile(ns, batch, "data/batch.txt")
}
