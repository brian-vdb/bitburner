/*
  Brian van den Berg
  Module: CreateHeal
  File: threads.js
  Description: Centralized functions for calculating thread counts for heal actions.
*/

/**
 * Calculates the optimal allocation for grow threads and the corresponding extra weaken threads.
 *
 * @param {import("../../../index").NS} ns - The environment object
 * @param {number} combinedLimit - The maximum number of threads available for both grow and extra weaken.
 * @returns {Object} An object with the optimal thread counts: { optimizedGrowThreads, optimizedGrowWeakenThreads }.
 */
function optimizeGrowthAllocation(ns, combinedLimit) {
  // Helper: total threads used for a given grow thread count x.
  function totalThreads(x) {
    return x + Math.ceil(ns.growthAnalyzeSecurity(x) / ns.weakenAnalyze(1)) + 1;
  }

  // Helper: cost function as the squared difference from combinedLimit.
  function cost(x) {
    let total = totalThreads(x);
    return Math.pow(total - combinedLimit, 2);
  }

  // Binary search over possible grow threads.
  let low = 0;
  let high = combinedLimit;
  let bestX = 0;
  let bestCost = cost(0);

  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    let totalMid = totalThreads(mid);
    let midCost = cost(mid);

    // Track the best candidate.
    if (midCost < bestCost) {
      bestCost = midCost;
      bestX = mid;
    }

    // Since totalThreads is monotonic, adjust the search bounds.
    if (totalMid < combinedLimit) {
      low = mid + 1;
    } else if (totalMid > combinedLimit) {
      high = mid - 1;
    } else {

      // Perfect match.
      bestX = mid;
      break;
    }
  }

  // Check neighboring candidates to account for discontinuities due to Math.ceil.
  for (let candidate of [bestX - 1, bestX, bestX + 1]) {
    if (candidate < 0) continue;
    let candidateCost = cost(candidate);
    if (candidateCost < bestCost) {
      bestCost = candidateCost;
      bestX = candidate;
    }
  }

  const optimizedGrowThreads = bestX;
  const optimizedGrowWeakenThreads =
    Math.ceil(ns.growthAnalyzeSecurity(optimizedGrowThreads) / ns.weakenAnalyze(1)) + 1;

  return { optimizedGrowThreads, optimizedGrowWeakenThreads };
}

/**
 * Calculates the required thread counts for healing a target.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {Object} target - The target object with its properties.
 * @param {number} [limit=undefined] - Optional limit on the total available threads.
 * @returns {Object} An object with thread counts: { weakenThreads, growThreads, growWeakenThreads }.
 */
function calculateHealThreads(ns, target, limit = undefined) {
  // Return nothing if the limit is 0.
  if (limit === 0) return {
    weakenThreads: 0,
    growThreads: 0,
    growWeakenThreads: 0
  };

  // Calculate base weaken threads required.
  let weakenThreads = 0;
  const securityGap = target.securityCurrent - target.securityMin;
  if (securityGap > 0) {
    weakenThreads = Math.ceil(securityGap / ns.weakenAnalyze(1)) + 1;
  }

  // Return the weaken threads if that's the only thing that fits.
  if (limit !== undefined && limit < weakenThreads) {
    return {
      weakenThreads: limit,
      growThreads: 0,
      growWeakenThreads: 0
    };
  }

  let growThreads = 0;
  let growWeakenThreads = 0;
  const multiplier = target.moneyMax / target.moneyCurrent;
  if (multiplier > 1) {
    // Calculate base grow threads required.
    growThreads = Math.ceil(ns.growthAnalyze(target.hostname, multiplier)) + 1;

    // Calculate the security increase from growing and the associated weaken threads needed.
    const securityIncrease = ns.growthAnalyzeSecurity(growThreads);
    growWeakenThreads = Math.ceil(securityIncrease / ns.weakenAnalyze(1)) + 1;
  }

  // Scale the threads if there aren't enough threads available.
  if (limit !== undefined && limit < weakenThreads + growThreads + growWeakenThreads) {
    // Calculate the available threads for the growth phase.
    const combinedLimit = limit - weakenThreads;

    // Use binary search to find the optimal allocation for grow and its weaken threads.
    const { optimizedGrowThreads, optimizedGrowWeakenThreads } = optimizeGrowthAllocation(ns, combinedLimit);
    growThreads = optimizedGrowThreads;
    growWeakenThreads = optimizedGrowWeakenThreads;
  }

  // Return the composed thread counts.
  return {
    weakenThreads,
    growThreads,
    growWeakenThreads
  };
}

/**
 * Calculates the required thread counts for a given target based on its status.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {Object} target - The target object with its properties.
 * @param {number} [limit=undefined] - Optional limit on the total available threads.
 * @returns {Object} An object with thread counts: { weakenThreads, growThreads, growWeakenThreads }.
 */
export function calculateThreadCounts(ns, target, limit=undefined) {
  switch (target.status) {
    case 'heal':
      return calculateHealThreads(ns, target, limit);
    default:
      return {
        weakenThreads: 0,
        growThreads: 0,
        growWeakenThreads: 0
      };
  }
}
