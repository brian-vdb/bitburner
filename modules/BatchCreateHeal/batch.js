/*
  Brian van den Berg
  Module: BatchCreateHeal
  File: batch.js
  Description: Functions related to the creation of a batch of attacks.
*/

import { calculateThreadCounts } from "./threads";

/**
 * Prepares a batch object for a target.
 *
 * @param {object} target - The target object.
 * @param {Object[]} targets - The collection of target objects.
 * @param {number} [hackInterval=1000] - The hack interval.
 * @returns {Object} The base batch object.
 */
function prepareBatch(target) {
  return {
    hostname: target.hostname,
    minTime: Math.min(target.weakenTime, target.growTime),
    maxTime: Math.max(target.weakenTime, target.growTime),
    mode: 'single',
  };
}

/**
 * Creates the thread composition for a heal batch.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object} target - The target object.
 * @param {number} [hackInterval=1000] - The hack interval.
 * @returns {Object[]} An array of thread event objects for a target.
 */
function createHealThreads(ns, target, hackInterval = 1000) {
  let threads = [];
  let offset = 0;
  let maxTime = Math.max(target.weakenTime, target.growTime);

  const { weakenThreads, growThreads, growWeakenThreads } = calculateThreadCounts(ns, target, target.threadsAssigned);

  if (weakenThreads > 0) {
    threads.push({
      action: 'weaken',
      amount: weakenThreads,
      additionalMsec: (maxTime - target.weakenTime + offset)
    });
    offset += hackInterval;
  }

  if (growThreads > 0 && growWeakenThreads > 0) {
    threads.push({
      action: 'grow',
      amount: growThreads,
      additionalMsec: (maxTime - target.growTime + offset)
    });
    offset += hackInterval;

    threads.push({
      action: 'weaken',
      amount: growWeakenThreads,
      additionalMsec: (maxTime - target.weakenTime + offset)
    });
    offset += hackInterval;
  }

  // Normalize the additionalMsec values
  if (threads.length > 0) {
    const minAdditionalMsec = Math.min(...threads.map(t => t.additionalMsec));
    threads = threads.map(t => ({
      ...t,
      additionalMsec: t.additionalMsec - minAdditionalMsec
    }));
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
      let batch = prepareBatch(target);
      batch.threads = threads;
      batches.push(batch);
    }
  });
  return batches;
}
