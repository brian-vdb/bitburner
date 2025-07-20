/*
  Brian van den Berg
  Module: ExtractionOrchestratedExecution
  File: main.js
  Description: Tool to execute batches of events based on scheduling metadata.
*/

import { readJSONFile } from "../../../../internal/json";
import { activeWaitUntil } from "../../../../internal/time";
import { createAllocation, executeAllocation, getHighestThreadCount } from "./events";

/**
 * Executes orchestrated batches by allocating threads across available hosts
 * and dispatching scripts based on scheduling metadata.
 *
 * Expected args:
 *   ns.args[0] - Path to hosts JSON file
 *   ns.args[1] - Path to batches JSON file
 *   ns.args[2] - Optional hack interval (default: 1000)
 *
 * @param {import("../../../../index").NS} ns - The Bitburner environment object.
 * @returns {Promise<void>}
 */
export async function main(ns) {
  if (ns.args.length < 2) {
    throw new Error(`Expected program parameters: [hostsFile: string, batchesFile: string, hackInterval?: number]`);
  }

  ns.disableLog("ALL");

  const hostsFile = ns.args[0];
  const batchesFile = ns.args[1];
  const hackInterval = ns.args[2] !== undefined ? Number(ns.args[2]) : 1000;

  const hosts = readJSONFile(ns, hostsFile);
  const batches = readJSONFile(ns, batchesFile);

  // Initialize available thread count
  for (const host of hosts) {
    host.threadsAvailable = host.maxThreadsAvailable;
  }

  // Early exit if there are no batches
  if (Object.keys(batches).length === 0) return;

  // Spacing ensures time separation between batch dispatches
  const spacing = getHighestThreadCount(batches) * hackInterval;

  const schedulingStartTime = Date.now();
  const schedulingEndTime = Object.values(batches)[0].schedulingEndTime + schedulingStartTime;
  let executionEndTime = 0;

  // Schedule loop: dispatch batches within their scheduling window
  while (true) {
    const now = Date.now();

    if (now >= schedulingEndTime || Object.keys(batches).length === 0) break;

    for (const hostname in batches) {
      const batch = batches[hostname];

      // Dispatch batch if its scheduling window has started
      if (now >= batch.schedulingStartTime + schedulingStartTime) {
        let allocationSuccess = true;

        for (const threadEvent of batch.threads) {
          const allocation = createAllocation(threadEvent, hosts, hostname);

          if (allocation.length === 0) {
            allocationSuccess = false;
            break;
          }

          executeAllocation(ns, allocation);
        }

        // If all threads were allocated successfully
        if (allocationSuccess) {
          batch.count--;
          executionEndTime = Math.max(executionEndTime, now + batch.maxTime + spacing);

          // Remove completed batches from queue
          if (batch.count <= 0) {
            delete batches[hostname];
          }
        }
      }
    }

    await ns.sleep(spacing);
  }

  // Ensure execution completes for the final batch
  await activeWaitUntil(ns, executionEndTime);
}
