/*
  Brian van den Berg
  Module: BatchCreateHeal
  File: batch.js
  Description: Functions related to the creation of a batch of attacks.
*/

import { createBatchTemplate } from "internal/batch";
import { calculateThreadCounts } from "./threads";

/**
 * Prepares a batch object for a target.
 *
 * @param {object} target - The target object.
 * @param {Object[]} targets - The collection of target objects.
 * @param {number} [hackInterval=1000] - The hack interval.
 * @returns {Object} The base batch object.
 */
function prepareBatch(target, targets, hackInterval=1000) {
  let batch = createBatchTemplate();
  
  // Set the initial batch metadata
  batch.hostname = target.hostname;
  batch.maxTime = Math.max(target.growTime, target.weakenTime);
  const executionStartTime = Math.max(...targets.map(target => Math.max(target.growTime, target.weakenTime)));
  batch.schedulingEndTime = executionStartTime - hackInterval;
  batch.schedulingStartTime = executionStartTime - batch.maxTime;
  batch.amount = 1;

  return batch;
}

/**
 * Creates the thread composition for a heal batch.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object} target - The target object.
 * @param {number} [hackInterval=1000] - The hack interval.
 * @returns {Object[]} An array of thread event objects for a target.
 */
function createHealThreads(ns, target, hackInterval=1000) {
  let threads = [];
  let offset = 0;
  let maxTime = Math.max(target.growTime, target.weakenTime);

  // Get the thread counts for heal (combined weaken and grow)
  const { weakenThreads, growThreads, growWeakenThreads } = calculateThreadCounts(ns, target, target.threadsAssigned);

  if (weakenThreads > 0) {
    // Create the weaken threads
    let additionalMsec = (maxTime - target.weakenTime + offset);
    threads.push({
      action: 'weaken',
      amount: weakenThreads,
      additionalMsec: additionalMsec
    });
    offset += hackInterval;
  }
  
  if (growThreads + growWeakenThreads > 0) {
    // Create the grow threads
    let additionalMsec = (maxTime - target.growTime + offset);
    threads.push({
      action: 'grow',
      amount: growThreads,
      additionalMsec: additionalMsec
    });
    offset += hackInterval;

    // Create the grow weaken threads
    additionalMsec = (maxTime - target.weakenTime + offset);
    threads.push({
      action: 'weaken',
      amount: growWeakenThreads,
      additionalMsec: additionalMsec
    });
    offset += hackInterval;
  }
  
  return threads;
}

/**
 * Creates the thread composition for a batch.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object} target - The target object.
 * @param {number} [hackInterval=1000] - The hack interval.
 * @returns {Object[]} An array of thread event objects for a target.
 */
function getTargetThreads(ns, target, hackInterval=1000) {
  switch (target.status) {
    case 'heal':
      return createHealThreads(ns, target, hackInterval);
    default:
      return [];
  }
}

/**
 * Creates a collection of batch objects for a collection of targets.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object[]} targets - The collection of target objects.
 * @param {number} [hackInterval=1000] - The hack interval.
 * @returns {Object[]} The collection of batch objects.
 */
export function createBatches(ns, targets, hackInterval = 1000) {
  let batches = [];
  targets.forEach(target => {
    let threads = getTargetThreads(ns, target, hackInterval);
    if (threads.length > 0) {
      let batch = prepareBatch(target, targets, hackInterval);
      batch.threads = threads;
      batches.push(batch);
    }
  });
  return batches;
}
