/*
  Brian van den Berg
  Module: BatchCreateHeal
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
  
  // Set the initial execution window variables
  batch.executionStartTime = Math.max(...targets.map(target => target.maxTime));
  batch.executionEndTime = batch.executionStartTime + (2 * hackInterval);
  batch.executionTimeFrame = batch.executionEndTime - batch.executionStartTime;
  batch.schedulingEndTime = batch.executionStartTime - hackInterval;
  
  // Initialize events as a SortedEventList instance with the optional initial events.
  return batch;
}

/**
 * Creates heal events for a target with finishTime included
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object} target - The target object
 * @param {Object} batch - The batch object containing executionStartTime, executionEndTime, etc.
 * @param {number} [hackInterval=1000] - The hack interval
 * @returns {Object[]} An array of event objects for heal actions (weaken and grow), or an empty array if no threads are allocated
 */
function createHealEvents(ns, target, batch, hackInterval=1000) {
  let events = [];

  // Get the thread counts for heal (combined weaken and grow)
  const { weakenThreads, growThreads, growWeakenThreads } = calculateThreadCounts(ns, target, target.threadsAssigned);

  if (weakenThreads > 0) {
    // Calculate the weaken start time and pusht he weaken event
    const weakenStartTime = batch.executionStartTime - target.weakenTime;
    events.push({
      time: weakenStartTime,
      target: target.hostname,
      action: 'weaken',
      threads: weakenThreads
    });
  }
  
  if (growThreads + growWeakenThreads > 0) {
    // Calculate the grow start times
    const growStartTime = batch.executionStartTime + ( 1 * hackInterval) - target.growTime;
    const growWeakenStartTime = batch.executionStartTime + ( 2 * hackInterval) - target.weakenTime;
    
    // Push the grow events
    events.push({
      time: growStartTime,
      target: target.hostname,
      action: 'grow',
      threads: growThreads
    });
    events.push({
      time: growWeakenStartTime,
      target: target.hostname,
      action: 'weaken',
      threads: growWeakenThreads
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
 * @param {number} [hackInterval=1000] - The hack interval
 * @returns {Object[]} An array of event objects created for the target
 */
function getTargetEvents(ns, target, batch, hackInterval=1000) {
  switch (target.status) {
    case 'heal':
      return createHealEvents(ns, target, batch, hackInterval);
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
 * @param {number} [hackInterval=1000] - The hack interval
 * @returns {Object} The updated batch object with events populated for all targets
 */
export function populateBatch(ns, targets, batch, hackInterval=1000) {
  targets.forEach(target => {
    const targetEvents = getTargetEvents(ns, target, batch, hackInterval);
    targetEvents.forEach(event => {
      batch.events.enqueue(event);
    });
  });
  return batch;
}
