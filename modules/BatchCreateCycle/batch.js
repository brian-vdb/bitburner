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
  batch.maxTime = target.maxTime;
  batch.executionStartTime = Math.max(...targets.map(target => Math.max(target.maxTime)));
  batch.schedulingEndTime = batch.executionStartTime - hackInterval;
  batch.schedulingStartTime = batch.executionStartTime - target.maxTime;
  batch.amount = 1;

  return batch;
}

/**
 * Creates the thread composition for a hack batch.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object} target - The target object.
 * @param {number} [hackInterval=1000] - The hack interval.
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @returns {Object[]} An array of thread event objects for a target.
 */
function createHackThreads(ns, target, hackInterval=1000, hackPercentage=10) {
  let threads = [];
  let offset = 0;
  let maxTime = target.maxTime;

  // Get the thread counts for heal (combined weaken and grow).
  const { hackThreads, hackWeakenThreads, growThreads, growWeakenThreads } = calculateThreadCounts(ns, target, hackPercentage, target.threadsAssigned);

  if (hackThreads + hackWeakenThreads + growThreads + growWeakenThreads > 0) {
    // Create the grow threads.
    let additionalMsec = (maxTime - target.hackTime + offset);
    threads.push({
      action: 'hack',
      amount: hackThreads,
      additionalMsec: additionalMsec
    });
    offset += hackInterval;

    // Create the grow weaken threads.
    additionalMsec = (maxTime - target.weakenTime + offset);
    threads.push({
      action: 'weaken',
      amount: hackWeakenThreads,
      additionalMsec: additionalMsec
    });
    offset += hackInterval;
    
    // Create the grow threads.
    additionalMsec = (maxTime - target.growTime + offset);
    threads.push({
      action: 'grow',
      amount: growThreads,
      additionalMsec: additionalMsec
    });
    offset += hackInterval;

    // Create the grow weaken threads.
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
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @returns {Object[]} An array of thread event objects for a target.
 */
function getTargetThreads(ns, target, hackInterval=1000, hackPercentage=10) {
  switch (target.status) {
    case 'hack':
      return createHackThreads(ns, target, hackInterval, hackPercentage);
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
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @returns {Object[]} The collection of batch objects.
 */
export function createBatches(ns, targets, hackInterval=1000, hackPercentage=10) {
  let batches = [];
  targets.forEach(target => {
    let threads = getTargetThreads(ns, target, hackInterval, hackPercentage);
    if (threads.length > 0) {
      let batch = prepareBatch(target, targets, hackInterval);
      batch.threads = threads;
      batches.push(batch);
    }
  });
  return batches;
}

/**
 * Creates a collection of batch objects for a collection of targets.
 *
 * @param {Object[]} targets - The collection of target objects.
 * @param {Object[]} batches - The collection of batch objects.
 * @param {Object[]} hosts - The collection of host objects.
 * @returns {Object[]} The collection of updated batch objects.
 */
export function scaleBatchAmounts(targets, batches, hosts) {
  // Calculate total threads cost from targets.
  const totalThreadsCost = targets.reduce((sum, target) => sum + target.threadsAssigned, 0);

  // Calculate total threads available from hosts.
  const totalThreadsAvailable = hosts.reduce((sum, host) => sum + host.threadsAvailable, 0);
  
  // Calculate the new amount based on the ratio of totalThreadsCost to totalThreadsAvailable.
  const newAmount = Math.floor(totalThreadsCost / totalThreadsAvailable);

  // Update the amount for every batch in the batches array.
  batches.forEach(batch => {
    batch.amount = newAmount;
  });

  return batches;
}
