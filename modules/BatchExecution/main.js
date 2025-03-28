/*
  Brian van den Berg
  Module: BatchExecution
  File: main.js
  Description: Tool to execute batches of events.
*/

import { readJSONFile } from "internal/json";
import { getHighestThreadCount, handleThreads } from "./threads";

function relocateTail(ns) {
  let size = ns.ui.windowSize();
  let width = 543;
  ns.ui.resizeTail(width, 132);
  ns.ui.moveTail(size[0] - width - 200, 0);
}

function reloadProgressBar(ns, title, currentTime, endTime) {
  // Adjust the position
  relocateTail(ns);
  
  // Clamp currentTime between 0 and endTime
  currentTime = Math.max(0, Math.min(currentTime, endTime));

  // Calculate the progress
  const progress = currentTime / endTime;
  const totalLength = 50;
  const filledLength = Math.round(progress * totalLength);
  const emptyLength = totalLength - filledLength;
  
  // Build the progress bar string
  const progressBar = `[${'|'.repeat(filledLength)}${'-'.repeat(emptyLength)}]`;
  
  // Clear the log and print the progress bar
  ns.clearLog();
  ns.print(`  ${title} Progress: [${Math.round(currentTime / 1000)}s/${Math.round(endTime / 1000)}s]`);
  ns.print(`  ${progressBar}`);
  ns.print(" ");
}

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

  // Setup data containers.
  let hosts = readJSONFile(ns, ns.args[0]);
  let batches = readJSONFile(ns, ns.args[1]);

  // Extract optional parameters with default values if not provided.
  const hackInterval = ns.args[2] !== undefined ? ns.args[2] : 1000;
  const hackCycleInterval = getHighestThreadCount(batches) * hackInterval;
  const title = ns.args[3] !== undefined ? ns.args[3] : 'Batch Execution';

  // Start the batch execution.
  if (batches.length > 0) {
    // Open the progress bar
    ns.disableLog("ALL");
    ns.ui.openTail();
    relocateTail(ns);
    
    // Set up the batch timing parameters.
    const startTime = Date.now();
    let currentTime = Date.now() - startTime;
    let endTime = currentTime;

    // Start firing batches.
    while (batches.length !== 0 || currentTime < endTime) {
      // Fetch the current time.
      currentTime = Date.now() - startTime;

      // Iterate over the batches in reverse order.
      for (let i = batches.length - 1; i >= 0; i--) {
        const batch = batches[i];
        if (batch.schedulingStartTime <= currentTime && batch.schedulingEndTime > currentTime) {
          // Schedule the batch.
          hosts = handleThreads(ns, batch.hostname, batch.threads, hosts);
          currentTime = Date.now() - startTime;
          endTime = Math.max(endTime, currentTime + batch.maxTime);

          // Maintain loop variables.
          batch.amount -= 1;
        }

        // Remove batch if its amount is 0 or if its scheduling end time has passed.
        if (batch.amount === 0 || batch.schedulingEndTime < currentTime) {
          batches.splice(i, 1);
        }
      }
      
      // Wait a hack cycle.
      reloadProgressBar(ns, title, currentTime, endTime);
      await ns.sleep(hackCycleInterval);
    }

    // Close the progress bar
    ns.ui.closeTail();
  }
}
