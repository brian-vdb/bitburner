/*
  Brian van den Berg
  Module: ExtractionOrchestratedHack
  File: batch.js
  Description: Functions related to the creation of a batch of hack threads.
*/

import { calculateThreadCounts } from "./threads";

/**
 * Prepares a base batch object without hostname metadata.
 *
 * @param {Object} target - The target object.
 * @returns {Object} Batch object with timing metadata.
 */
function prepareBatch(target) {
  return {
    minTime: target.hackTime,
    maxTime: target.hackTime,
    count: 1,
  };
}

/**
 * Generates a thread sequence for a hack operation.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object} target - Target object.
 * @param {number} [hackPercentage=10] - Percentage of money to hack.
 * @returns {Object[]} List of thread event descriptors.
 */
function createHackThreads(ns, target, hackPercentage = 10) {
  const threads = [];
  const { hackThreads } = calculateThreadCounts(ns, target, hackPercentage, target.threadsAssigned);

  if (hackThreads > 0) {
    threads.push({
      action: "hack",
      amount: hackThreads,
      additionalMsec: 0,
    });
  }

  return threads;
}

/**
 * Selects the appropriate thread plan for the given target.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object} target - Target object.
 * @param {number} [hackPercentage=10] - Percentage of money to hack.
 * @returns {Object[]} Thread events for the batch.
 */
function getTargetThreads(ns, target, hackPercentage = 10) {
  switch (target.status) {
    case "hack":
      return createHackThreads(ns, target, hackPercentage);
    default:
      return [];
  }
}

/**
 * Creates a batch plan mapping by target hostname.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object[]} targets - List of prepared target objects.
 * @param {number} [hackPercentage=10] - Percentage of money to hack.
 * @returns {{ [hostname: string]: Object }} Mapping of hostname to batch object.
 */
export function createBatches(ns, targets, hackPercentage = 10) {
  const batches = {};

  for (const target of targets) {
    const threads = getTargetThreads(ns, target, hackPercentage);
    if (threads.length > 0) {
      const batch = prepareBatch(target);
      batch.threads = threads;
      batches[target.hostname] = batch;
    }
  }

  return batches;
}
