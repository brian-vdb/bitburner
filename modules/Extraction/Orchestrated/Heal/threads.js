/*
  Brian van den Berg
  Module: ExtractionOrchestratedHeal
  File: threads.js
  Description: Centralized functions for calculating thread counts for heal operations.
*/

/**
 * Calculates grow and grow-weaken thread split using binary search optimization.
 *
 * @param {import("../../../../index").NS} ns - The environment object.
 * @param {number} combinedLimit - Total threads to allocate between grow and weaken.
 * @returns {{ optimizedGrowThreads: number, optimizedGrowWeakenThreads: number }}
 */
function optimizeGrowthAllocation(ns, combinedLimit) {
  function total(x) {
    return x + Math.ceil(ns.growthAnalyzeSecurity(x) / ns.weakenAnalyze(1));
  }

  function cost(x) {
    return Math.pow(total(x) - combinedLimit, 2);
  }

  let bestX = 0;
  let bestCost = cost(0);
  let low = 0, high = combinedLimit;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midTotal = total(mid);
    const midCost = cost(mid);

    if (midCost < bestCost) {
      bestX = mid;
      bestCost = midCost;
    }

    if (midTotal < combinedLimit) low = mid + 1;
    else if (midTotal > combinedLimit) high = mid - 1;
    else break;
  }

  for (const x of [bestX - 1, bestX + 1]) {
    if (x >= 0 && cost(x) < bestCost) bestX = x;
  }

  return {
    optimizedGrowThreads: bestX,
    optimizedGrowWeakenThreads: Math.ceil(ns.growthAnalyzeSecurity(bestX) / ns.weakenAnalyze(1)),
  };
}

/**
 * Calculates thread requirements for a heal cycle.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object} target - Target object.
 * @param {number} [limit] - Optional thread cap.
 * @returns {{ weakenThreads: number, growThreads: number, growWeakenThreads: number }}
 */
function calculateHealThreads(ns, target, limit) {
  if (limit === 0) return { weakenThreads: 0, growThreads: 0, growWeakenThreads: 0 };

  const gap = target.securityCurrent - target.securityMin;
  let weakenThreads = gap > 0 ? Math.ceil(gap / ns.weakenAnalyze(1)) + 1 : 0;

  if (limit !== undefined && limit < weakenThreads) {
    return { weakenThreads: limit, growThreads: 0, growWeakenThreads: 0 };
  }

  const multiplier = target.moneyMax / target.moneyCurrent;
  let growThreads = 0;
  let growWeakenThreads = 0;

  if (multiplier > 1) {
    growThreads = Math.ceil(ns.growthAnalyze(target.hostname, multiplier)) + 1;
    growWeakenThreads = Math.ceil(ns.growthAnalyzeSecurity(growThreads) / ns.weakenAnalyze(1));
  }

  if (limit !== undefined && limit < weakenThreads + growThreads + growWeakenThreads) {
    const limitGrow = limit - weakenThreads;
    const opt = optimizeGrowthAllocation(ns, limitGrow);
    growThreads = opt.optimizedGrowThreads;
    growWeakenThreads = opt.optimizedGrowWeakenThreads;
  }

  return { weakenThreads, growThreads, growWeakenThreads };
}

/**
 * Dispatches the thread count calculation based on target status.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object} target - Target data.
 * @param {number} [limit] - Optional thread cap.
 * @returns {{ weakenThreads: number, growThreads: number, growWeakenThreads: number }}
 */
export function calculateThreadCounts(ns, target, limit) {
  switch (target.status) {
    case "heal":
      return calculateHealThreads(ns, target, limit);
    default:
      return { weakenThreads: 0, growThreads: 0, growWeakenThreads: 0 };
  }
}
