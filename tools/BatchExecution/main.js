/*
  Brian van den Berg
  Module: BatchExecution
  File: main.js
  Description: Tool to execute batches of events.
*/

import { readJSONFile } from "internal/json";
import { SortedEventList } from "../BatchAnalysis/batch";
import { activeWaitUntil } from "../../internal/time";
import { handleEvent } from "./events";

/**
 * Perform a batch execution.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the execution is complete.
 */
export async function main(ns) {
  if (ns.args.length < 2) {
    throw new Error(`Expected program parameters: [hostsFile: string, batchFile: string]`);
  }

  // Setup data containers
  let hosts = readJSONFile(ns, ns.args[0]);
  const batch = readJSONFile(ns, ns.args[1]);
  batch.events = new SortedEventList(batch.events);

  // Initialize sliding average of delays using an exponential moving average (EMA)
  let offset = 3;
  const alpha = 0.2;

  // Start the event firing cycle from the current time
  const startTime = Date.now();
  let event = batch.events.dequeue();
  while (event) {
    // Fetch the current time
    let currentTime = Date.now() - startTime;
    if (currentTime < event.time) {
      currentTime = await activeWaitUntil(ns, event.time + startTime - offset) - startTime;
    }

    // Fire all the events that need to be fired
    while (event && event.time <= currentTime) {
      // Fire the event
      hosts = handleEvent(ns, event, hosts);

      // Update the sliding average delay (EMA) and sleep offset
      const delay = (Date.now() - startTime) - event.time;
      ns.tprint(`[${currentTime}]: ${event.action} -> ${event.target} (delay: ${delay.toFixed(2)}ms, offset: ${offset.toFixed(2)}ms)`);
      offset = (1 - alpha) * offset + alpha * (delay + offset);

      // Get the next event from the queue.
      event = batch.events.dequeue();
    }
  }

  // Sleep untill the end of the execution cycle
  let currentTime = await activeWaitUntil(ns, batch.executionEndTime + startTime + offset) - startTime;
  ns.tprint(`[${currentTime}]: Finished Batch execution`);
  
}
