/*
  Brian van den Berg
  Module: ExtractionOrchestratedHeal
  File: batch.js
  Description: Functions related to the creation of a batch of heal threads.
*/

import { calculateThreadCounts } from "./threads";

/**
 * Prepares a base batch object without hostname metadata.
 *
 * @param {Object} target - The target object.
 * @returns {Object} Batch object without thread definitions or hostname.
 */
function prepareBatch(target) {
  return {
    minTime: Math.min(target.weakenTime, target.growTime),
    maxTime: Math.max(target.weakenTime, target.growTime),
    count: 1,
  };
}

/**
 * Generates a thread sequence for a heal operation, normalized by timing.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object} target - Target object.
 * @param {number} [hackInterval=1000] - Milliseconds to stagger each action.
 * @returns {Object[]} List of thread event descriptors.
 */
function createHealThreads(ns, target, hackInterval = 1000) {
  let threads = [];
  let offset = 0;
  const maxTime = Math.max(target.weakenTime, target.growTime);

  const { weakenThreads, growThreads, growWeakenThreads } = calculateThreadCounts(ns, target, target.threadsAssigned);

  if (weakenThreads > 0) {
    threads.push({
      action: "weaken",
      amount: weakenThreads,
      additionalMsec: maxTime - target.weakenTime + offset,
    });
    offset += hackInterval;
  }

  if (growThreads > 0 && growWeakenThreads > 0) {
    threads.push({
      action: "grow",
      amount: growThreads,
      additionalMsec: maxTime - target.growTime + offset,
    });
    offset += hackInterval;

    threads.push({
      action: "weaken",
      amount: growWeakenThreads,
      additionalMsec: maxTime - target.weakenTime + offset,
    });
    offset += hackInterval;
  }

  // Normalize timings
  if (threads.length > 0) {
    const min = Math.min(...threads.map(t => t.additionalMsec));
    threads = threads.map(t => ({ ...t, additionalMsec: t.additionalMsec - min }));
  }

  return threads;
}

/**
 * Selects the appropriate thread plan for the given target.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object} target - Target object.
 * @param {number} [hackInterval=1000] - Action interval.
 * @returns {Object[]} Thread events for the batch.
 */
function getTargetThreads(ns, target, hackInterval = 1000) {
  switch (target.status) {
    case "heal":
      return createHealThreads(ns, target, hackInterval);
    default:
      return [];
  }
}

/**
 * Creates a batch plan mapping by target hostname.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object[]} targets - List of prepared target objects.
 * @param {number} [hackInterval=1000] - Action delay interval.
 * @returns {{ [hostname: string]: Object }} Mapping of hostname to batch object.
 */
export function createBatches(ns, targets, hackInterval = 1000) {
  const batches = {};

  for (const target of targets) {
    const threads = getTargetThreads(ns, target, hackInterval);
    if (threads.length > 0) {
      const batch = prepareBatch(target);
      batch.threads = threads;
      batches[target.hostname] = batch;
    }
  }

  return batches;
}
