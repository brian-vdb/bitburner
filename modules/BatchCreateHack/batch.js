/*
  Brian van den Berg
  Module: BatchCreateHack
  File: batch.js
  Description: Functions related to the creation of a batch of attacks
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
  batch.maxTime = target.hackTime;
  batch.executionStartTime = Math.max(...targets.map(target => target.hackTime));
  batch.schedulingEndTime = batch.executionStartTime - hackInterval;
  batch.schedulingStartTime = batch.executionStartTime - batch.maxTime;
  batch.amount = 1;

  return batch;
}

/**
 * Creates the thread composition for a hack batch.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {object} target - The target object.
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @returns {Object[]} An array of thread objects created for the target.
 */
function createHackThreads(ns, target, hackPercentage=10) {
  let threads = [];

  // Get the thread counts for hack
  const { hackThreads } = calculateThreadCounts(ns, target, hackPercentage, target.threadsAssigned);
  
  if (hackThreads > 0) {
    // Create the hack threads
    threads.push({
      action: 'hack',
      amount: hackThreads,
      additionalMsec: 0
    });
  }

  return threads;
}

/**
 * Creates the thread composition for a batch.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object} target - The target object.
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @returns {Object[]} An array of thread objects created for the target.
 */
function getTargetThreads(ns, target = 1000, hackPercentage=10) {
  switch (target.status) {
    case 'hack':
      return createHackThreads(ns, target, hackPercentage);
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
export function createBatches(ns, targets, hackInterval = 1000, hackPercentage=10) {
  let batches = [];
  targets.forEach(target => {
    let batch = prepareBatch(target, targets, hackInterval);
    batch.threads = getTargetThreads(ns, target, hackPercentage);
    batches.push(batch);
  });
  return batches;
}
