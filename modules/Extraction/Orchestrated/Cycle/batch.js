/*
  Brian van den Berg
  Module: ExtractionOrchestratedCycle
  File: batch.js
  Description: Creates HWGW thread batches for execution.
*/

import { calculateThreadCounts } from "./threads";

/**
 * Initializes a base batch object.
 *
 * @param {Object} target
 * @returns {Object}
 */
function prepareBatch(target) {
  return {
    minTime: Math.min(target.hackTime, target.growTime, target.weakenTime),
    maxTime: Math.max(target.hackTime, target.growTime, target.weakenTime),
    count: 1,
  };
}

/**
 * Generates HWGW thread structure for a single target.
 *
 * @param {import("../../../../index").NS} ns
 * @param {Object} target
 * @param {number} hackInterval
 * @param {number} hackPercentage
 * @returns {Object[]}
 */
function createCycleThreads(ns, target, hackInterval, hackPercentage) {
  const { hackThreads, hackWeakenThreads, growThreads, growWeakenThreads } =
    calculateThreadCounts(ns, target, hackPercentage, target.threadsAssigned);

  const maxTime = Math.max(target.hackTime, target.growTime, target.weakenTime);
  let offset = 0;
  const threads = [];

  if (hackThreads > 0) {
    threads.push({
      action: "hack",
      amount: hackThreads,
      additionalMsec: maxTime - target.hackTime + offset,
    });
    offset += hackInterval;
  }

  if (hackWeakenThreads > 0) {
    threads.push({
      action: "weaken",
      amount: hackWeakenThreads,
      additionalMsec: maxTime - target.weakenTime + offset,
    });
    offset += hackInterval;
  }

  if (growThreads > 0) {
    threads.push({
      action: "grow",
      amount: growThreads,
      additionalMsec: maxTime - target.growTime + offset,
    });
    offset += hackInterval;
  }

  if (growWeakenThreads > 0) {
    threads.push({
      action: "weaken",
      amount: growWeakenThreads,
      additionalMsec: maxTime - target.weakenTime + offset,
    });
  }

  // Normalize offsets
  const min = Math.min(...threads.map(t => t.additionalMsec));
  return threads.map(t => ({ ...t, additionalMsec: t.additionalMsec - min }));
}

/**
 * Creates all batches from eligible targets.
 *
 * @param {import("../../../../index").NS} ns
 * @param {Object[]} targets
 * @param {number} hackInterval
 * @param {number} hackPercentage
 * @returns {{ [hostname: string]: Object }}
 */
export function createBatches(ns, targets, hackInterval = 1000, hackPercentage = 10) {
  const batches = {};

  for (const target of targets) {
    const threads = createCycleThreads(ns, target, hackInterval, hackPercentage);
    if (threads.length > 0) {
      const batch = prepareBatch(target);
      batch.threads = threads;
      batches[target.hostname] = batch;
    }
  }

  return batches;
}

/**
 * Finds the batch count that utilizes the most threads within timing and thread constraints.
 *
 * @param {number} totalThreadsAvailable
 * @param {number} threadsPerBatch
 * @param {number} timeLimit
 * @param {number} hackInterval
 * @returns {number}
 */
export function findOptimalThreadUtilization(totalThreadsAvailable, threadsPerBatch, timeLimit, hackInterval) {
  if (threadsPerBatch === 0) return 0;

  let low = 0;
  let high = Math.floor(totalThreadsAvailable / threadsPerBatch);

  let bestCount = 0;
  let bestThreadUse = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const duration = 4 * hackInterval * mid;
    const threadUse = mid * threadsPerBatch;

    if (duration <= timeLimit && threadUse <= totalThreadsAvailable) {
      if (threadUse > bestThreadUse) {
        bestThreadUse = threadUse;
        bestCount = mid;
      }
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestCount;
}
/**
 * Scales batch `count` values based on available threads and timing limits.
 * Excludes targets where batch duration (4 × interval × count) exceeds maxTime.
 * If all are excluded, fallback to top half of slowest targets and scale to timing.
 *
 * @param {Object[]} initialTargets - Original target list (with threadsAssigned, maxTime).
 * @param {{ [hostname: string]: Object }} batches - Batch mapping by hostname.
 * @param {Object[]} hosts - Host list with maxThreadsAvailable.
 * @param {number} hackInterval - Interval (ms) between HWGW steps.
 * @returns {{ [hostname: string]: Object }} Final scaled batch set.
 */
export function scaleBatchCounts(initialTargets, batches, hosts, hackInterval) {
  const totalThreadsAvailable = hosts.reduce((sum, h) => sum + h.maxThreadsAvailable, 0);
  if (totalThreadsAvailable === 0) return {};

  let targets = [...initialTargets].sort((a, b) => a.maxTime - b.maxTime);

  // Filter and scale until valid set is found
  while (targets.length > 0) {
    const totalThreadsNeeded = targets.reduce((sum, t) => sum + t.threadsAssigned, 0);
    if (totalThreadsNeeded === 0) break;

    const scaleFactor = Math.floor(totalThreadsAvailable / totalThreadsNeeded);
    if (scaleFactor < 1) break;

    const valid = targets.filter(t => (scaleFactor * 4 * hackInterval <= t.maxTime - 4 * hackInterval));
    
    if (valid.length === targets.length) {
      const result = {};
      for (const t of valid) {
        const batch = batches[t.hostname];
        if (!batch) continue;
        batch.count = scaleFactor;
        result[t.hostname] = batch;
      }

      return result;
    }

    targets = valid;
  }

  // Fallback when thread availability is too high to fit
  if (initialTargets.length === 0) return {};

  const maxTimeValues = initialTargets.map(t => t.maxTime);
  const minTime = Math.min(...maxTimeValues);
  const maxTime = Math.max(...maxTimeValues);
  const halfwayPoint = ((maxTime - minTime) / 2) + minTime;

  const selected = initialTargets.filter(t => t.maxTime >= halfwayPoint);
  if (selected.length === 0) return {};

  // Time constraint (subtract 4x interval for cycle spacing)
  const timeLimit = Math.min(...selected.map(t => t.maxTime - 4 * hackInterval));

  // Average threads per batch cycle (based on threadsAssigned per target)
  const avgThreadsPerBatch = selected.reduce((sum, t) => sum + t.threadsAssigned, 0) / selected.length;

  // Max batches that fit
  const fallbackCount = findOptimalThreadUtilization(totalThreadsAvailable, avgThreadsPerBatch, timeLimit, hackInterval);
  if (fallbackCount < 1) return {};

  const result = {};
  for (const t of selected) {
    const batch = batches[t.hostname];
    if (!batch) continue;
    batch.count = fallbackCount;
    result[t.hostname] = batch;
  }

  return result;
}
