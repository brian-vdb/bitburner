/*
  Brian van den Berg
  Module: Execution
  File: main.js
  Description: Tool to execute batches of events.
*/

import { readJSONFile } from "../../../internal/json";

/**
 * Entry point for batch execution orchestration.
 *
 * Expected args:
 *   ns.args[0] - Path to hosts JSON file
 *   ns.args[1] - Path to batches JSON file
 *   ns.args[2] - Optional hack interval (default: 1000)
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @returns {Promise<void>}
 */
export async function main(ns) {
  if (ns.args.length < 2) {
    throw new Error(`Expected program parameters: [hostsFile: string, batchesFile: string, hackInterval?: number]`);
  }

  ns.disableLog("ALL");

  const hosts = readJSONFile(ns, ns.args[0]);
  const batches = readJSONFile(ns, ns.args[1]);
  const hackInterval = ns.args[2] !== undefined ? Number(ns.args[2]) : 1000;

  // TODO: Insert batch scheduling and execution logic here.
}
