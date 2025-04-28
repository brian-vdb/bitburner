/*
  Brian van den Berg
  Module: BatchCreateHeal
  File: threads.js
  Description: Centralized functions for calculating thread counts for hack actions.
*/

/**
 * Optimizes the allocation of threads for a hack, weaken, grow, and weaken batch.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object} target - The target object with properties such as hostname.
 * @param {number} hackPercentage - The desired hack percentage (e.g., 10 for 10%).
 * @param {number} combinedLimit - The maximum total threads available for the entire batch.
 * @returns {Object} An object with the optimal thread counts:
 *                   { hackThreads, hackWeakenThreads, growThreads, growWeakenThreads }.
 */
function optimizeHackAllocation(ns, target, hackPercentage, combinedLimit) {
  // Helper: Given a hack percentage x (in percent), compute the total threads required.
  function totalThreads(x) {
    const hackFraction = x / 100;
    const hackThreads = Math.floor(hackFraction / ns.hackAnalyze(target.hostname));
    const hackSecIncrease = ns.hackAnalyzeSecurity(hackThreads);
    const hackWeakenThreads = Math.ceil(hackSecIncrease / ns.weakenAnalyze(1) * 1.1) + 1;

    const multiplier = 1 / (1 - hackFraction);
    const growThreads = Math.ceil(ns.growthAnalyze(target.hostname, multiplier) * 1.1) + 1;
    const growSecIncrease = ns.growthAnalyzeSecurity(growThreads);
    const growWeakenThreads = Math.ceil(growSecIncrease / ns.weakenAnalyze(1) * 1.1) + 1;

    return hackThreads + hackWeakenThreads + growThreads + growWeakenThreads;
  }

  // Ensure that even 0% hack is within the limit.
  if (totalThreads(0) > combinedLimit) {
    // Not enough threads even for a baseline batch.
    return {
      hackThreads: 0,
      hackWeakenThreads: 0,
      growThreads: 0,
      growWeakenThreads: 0
    };
  }

  // Binary search for the maximum hack percentage such that totalThreads(x) <= combinedLimit.
  let low = 0;
  let high = hackPercentage;
  let optimalHackPercent = 0;
  const tolerance = 0.01;

  while (high - low > tolerance) {
    let mid = (low + high) / 2;
    if (totalThreads(mid) <= combinedLimit) {
      optimalHackPercent = mid; // mid is acceptable
      low = mid; // try a higher hack percentage
    } else {
      high = mid; // mid exceeds the limit, try lower values
    }
  }

  // Calculate the final thread counts using the optimized hack percentage.
  const optimalHackFraction = optimalHackPercent / 100;
  const hackThreads = Math.floor(optimalHackFraction / ns.hackAnalyze(target.hostname));
  const hackSecIncrease = ns.hackAnalyzeSecurity(hackThreads);
  const hackWeakenThreads = Math.ceil(hackSecIncrease / ns.weakenAnalyze(1) * 1.1) + 1;

  const multiplier = 1 / (1 - optimalHackFraction);
  const growThreads = Math.ceil(ns.growthAnalyze(target.hostname, multiplier) * 1.1) + 1;
  const growSecIncrease = ns.growthAnalyzeSecurity(growThreads);
  const growWeakenThreads = Math.ceil(growSecIncrease / ns.weakenAnalyze(1) * 1.1) + 1;

  return { hackThreads, hackWeakenThreads, growThreads, growWeakenThreads };
}

/**
 * Calculates the required thread counts for cycle hacking a target.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object} target - The target object with its properties.
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @param {number} [limit=undefined] - Optional limit on the total available threads.
 * @returns {Object} An object with thread counts: { hackThreads, hackWeakenThreads, growThreads, growWeakenThreads }.
 */
function calculateHackThreads(ns, target, hackPercentage = 10, limit = undefined) {
  // Return zeros if the limit is 0.
  if (limit === 0) return {
    hackThreads: 0,
    hackWeakenThreads: 0,
    growThreads: 0,
    growWeakenThreads: 0
  };

  // Calculate hack threads needed to steal hackFraction of the target's money.
  const hackFraction = hackPercentage / 100;
  let hackThreads = Math.floor(hackFraction / ns.hackAnalyze(target.hostname));

  // Calculate the security increase from hacking and the weaken threads to offset it.
  const hackSecIncrease = ns.hackAnalyzeSecurity(hackThreads);
  let hackWeakenThreads = Math.ceil(hackSecIncrease / ns.weakenAnalyze(1) * 1.1) + 1;

  // Calculate the grow threads to restore the hacked money.
  const multiplier = 1 / (1 - hackFraction);
  let growThreads = Math.ceil(ns.growthAnalyze(target.hostname, multiplier) * 1.1) + 1;

  // Calculate the security increase from growing and the weaken threads to offset it.
  const growSecIncrease = ns.growthAnalyzeSecurity(growThreads);
  let growWeakenThreads = Math.ceil(growSecIncrease / ns.weakenAnalyze(1) * 1.1) + 1;

  // If the total required threads exceed the limit, use the optimized allocation.
  if (limit !== undefined && (hackThreads + hackWeakenThreads + growThreads + growWeakenThreads) > limit) {
    const optimized = optimizeHackAllocation(ns, target, hackPercentage, limit);
    hackThreads = optimized.hackThreads;
    hackWeakenThreads = optimized.hackWeakenThreads;
    growThreads = optimized.growThreads;
    growWeakenThreads = optimized.growWeakenThreads;
  }

  // Return the computed thread counts.
  return {
    hackThreads,
    hackWeakenThreads,
    growThreads,
    growWeakenThreads
  };
}

/**
 * Calculates the required thread counts for a given target based on its status.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object} target - The target object with its properties.
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @param {number} [limit=undefined] - Optional limit on the total available threads.
 * @returns {Object} An object with thread counts: { hackThreads, hackWeakenThreads, growThreads, growWeakenThreads }.
 */
export function calculateThreadCounts(ns, target, hackPercentage=10, limit=undefined) {
  switch (target.status) {
    case 'hack':
      return calculateHackThreads(ns, target, hackPercentage, limit);
    default:
      return {
        hackThreads: 0,
        hackWeakenThreads: 0,
        growThreads: 0,
        growWeakenThreads: 0
      };
  }
}
