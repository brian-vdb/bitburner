/*
  Brian van den Berg
  Module: BatchCreateHack
  File: batch.js
  Description: Functions related to the creation of a batch of attacks
*/

import { createBaseBatch } from "../../internal/batch";
import { calculateThreadCounts } from "./threads";

/**
 * Prepares the timeframe for a batch of attacks on the targets
 *
 * @param {Object[]} targets - The collection of target objects
 * @param {number} [hackInterval=1000] - The hack interval
 * @returns {Object} An object containing executionStartTime, executionEndTime, and a SortedEventList for events
 */
export function prepareBatch(targets, hackInterval=1000) {
  let batch = createBaseBatch();

  // Set the execution window according to hack targets
  const hackTargets = targets.filter(target => target.status === "hack");
  if (hackTargets.length > 0) {
    batch.executionStartTime = Math.max(...hackTargets.map(target => target.hackTime));
    batch.schedulingEndTime = batch.executionStartTime - hackInterval;
    batch.executionEndTime = batch.executionStartTime;
  }
  
  // Initialize events as a SortedEventList instance with the optional initial events
  return batch;
}

/**
 * Creates hack events for a target
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object} target - The target object
 * @param {Object} batch - The batch object containing executionStartTime, executionEndTime, etc.
 * @param {number} [hackPercentage=10] - The hack percentage
 * @returns {Object[]} An array of event objects for heal actions (weaken and grow), or an empty array if no threads are allocated
 */
function createHackEvents(ns, target, batch, hackPercentage=10) {
  let events = [];

  // Get the thread counts for hack
  const { hackThreads } = calculateThreadCounts(ns, target, hackPercentage, target.threadsAssigned);
  
  if (hackThreads > 0) {
    // Calculate the hack start time
    const hackStartTime = batch.executionStartTime - target.hackTime;
    
    // Create the grow event
    events.push({
      time: hackStartTime,
      target: target.hostname,
      action: 'hack',
      threads: hackThreads
    });
  }

  return events;
}

/**
 * Prepares the batch events for a target
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object} target - The target object for which to create batch events
 * @param {Object} batch - The batch object
 * @param {number} [hackPercentage=10] - The hack percentage
 * @returns {Object[]} An array of event objects created for the target
 */
function getTargetEvents(ns, target, batch, hackPercentage=10) {
  switch (target.status) {
    case 'hack':
      return createHackEvents(ns, target, batch, hackPercentage);
    default:
      return [];
  }
}

/**
 * Populates the batch with events for all targets
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object[]} targets - The collection of target objects to process
 * @param {Object} batch - The batch object
 * @param {number} [hackPercentage=10] - The hack percentage
 * @returns {Object} The updated batch object with events populated for all targets
 */
export function populateBatch(ns, targets, batch, hackPercentage=10) {
  targets.forEach(target => {
    const targetEvents = getTargetEvents(ns, target, batch, hackPercentage);
    targetEvents.forEach(event => {
      batch.events.enqueue(event);
    });
  });
  return batch;
}
