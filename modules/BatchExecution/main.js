/*
  Brian van den Berg
  Module: BatchExecution
  File: main.js
  Description: Tool to execute batches of events.
*/

import { readJSONFile } from "../../internal/json";
import { activeWaitUntil } from "../../internal/time";
import { createAllocation, executeAllocation, getHighestThreadCount } from "./threads";

/**
 * Perform a batch execution.
 * 
 * Optional args:
 *   ns.args[2] - hack interval (default: 1000)
 *   ns.args[3] - ttitle (default: 'Batch Execution')
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the execution is complete.
 */
export async function main(ns) {
  if (ns.args.length < 2) {
    throw new Error(`Expected program parameters: [hostsFile: string, batchesFile: string, hackInterval?: number]`);
  }

  // Disable default logs.
  ns.disableLog("ALL");

  // Setup data containers.
  let hosts = readJSONFile(ns, ns.args[0]);
  let batches = readJSONFile(ns, ns.args[1]);

  // Extract optional parameters with default values if not provided.
  const hackInterval = ns.args[2] !== undefined ? ns.args[2] : 1000;
  const hackCycleInterval = getHighestThreadCount(batches) * hackInterval;

  // Set up the batch timing parameters.
  const startTime = Date.now();
  let batchTime = 0;
  let schedulingEndTime = Infinity;
  let executionEndTime = 0;

  // Start firing batches.
  while (true) {
    const allocation = [];
    let extendExecutionEndTime = 0;
    
    // Iterate over the batches.
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      // Check if batches are allowed to be created
      if (batchTime < batch.schedulingStartTime) continue;

      // Set up the data containers
      let batchAllocation = [];
      let validBatch = true;

      // Check each threadsObj in the batch.
      for (const threadsObj of batch.threads) {
        const threadAllocation = createAllocation(threadsObj, hosts, batch.hostname);

        // If allocation for a thread is empty, mark the batch as invalid and exit the loop.
        if (threadAllocation.length === 0) {
          validBatch = false;
          break;
        }

        // Otherwise, accumulate the allocations.
        batchAllocation.push(...threadAllocation);
        extendExecutionEndTime = batch.maxTime > extendExecutionEndTime ?
          batch.maxTime : extendExecutionEndTime;
        schedulingEndTime = batch.schedulingEndTime < schedulingEndTime ?
          batch.schedulingEndTime : schedulingEndTime;
      }

      // Remove batch if its amount is 0 or if its scheduling end time has passed.
      batch.amount -= 1;
      if (batch.amount === 0 || batch.schedulingEndTime < batchTime) {
        batches.splice(i, 1);
      }

      // If the batch is valid (all threads allocated), merge its allocations.
      if (validBatch) {
        allocation.push(...batchAllocation);
      }
    }

    // Sleep to the batch time.
    await activeWaitUntil(ns, batchTime + startTime);

    // Perform the hacks.
    executeAllocation(ns, allocation);

    // Measure the timing window
    let currentTime = Date.now();
    batchTime = currentTime - startTime + hackCycleInterval;
    executionEndTime = currentTime + extendExecutionEndTime + hackCycleInterval > executionEndTime ?
      currentTime + extendExecutionEndTime + hackCycleInterval :
      executionEndTime;

    // Check if the scheduling time is finished or batches were fired.
    if (batchTime - startTime >= schedulingEndTime || batches.length === 0) break;
  }

  // Sleep to the end time.
  await activeWaitUntil(ns, executionEndTime);
}
