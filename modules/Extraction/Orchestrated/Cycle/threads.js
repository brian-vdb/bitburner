/*
  Brian van den Berg
  Module: ExtractionOrchestratedCycle
  File: threads.js
  Description: Centralized functions for calculating thread counts for HWGW hack cycles.
*/

/**
 * Performs binary search to find optimal hack percentage under a total thread limit.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object} target - Target server object.
 * @param {number} hackPercentage - Maximum allowed hack percentage.
 * @param {number} combinedLimit - Maximum total threads for the HWGW batch.
 * @returns {{ hackThreads: number, hackWeakenThreads: number, growThreads: number, growWeakenThreads: number }}
 */
function optimizeHackAllocation(ns, target, hackPercentage, combinedLimit) {
  function totalThreads(percent) {
    const hackFrac = percent / 100;
    const hackThreads = Math.floor(hackFrac / ns.hackAnalyze(target.hostname));
    const hackSec = ns.hackAnalyzeSecurity(hackThreads);
    const hackWeakenThreads = Math.ceil(hackSec / ns.weakenAnalyze(1) * 1.1);

    const multiplier = 1 / (1 - hackFrac);
    const growThreads = Math.ceil(ns.growthAnalyze(target.hostname, multiplier) * 1.1);
    const growSec = ns.growthAnalyzeSecurity(growThreads);
    const growWeakenThreads = Math.ceil(growSec / ns.weakenAnalyze(1) * 1.1);

    return hackThreads + hackWeakenThreads + growThreads + growWeakenThreads;
  }

  // If even 0% exceeds limit, return zeros
  if (totalThreads(0) > combinedLimit) {
    return {
      hackThreads: 0,
      hackWeakenThreads: 0,
      growThreads: 0,
      growWeakenThreads: 0,
    };
  }

  let low = 0;
  let high = hackPercentage;
  let bestPercent = 0;
  const tolerance = 0.01;

  while (high - low > tolerance) {
    const mid = (low + high) / 2;
    if (totalThreads(mid) <= combinedLimit) {
      bestPercent = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  // Final thread counts using optimized percentage
  const hackFrac = bestPercent / 100;
  const hackThreads = Math.floor(hackFrac / ns.hackAnalyze(target.hostname));
  const hackSec = ns.hackAnalyzeSecurity(hackThreads);
  const hackWeakenThreads = Math.ceil(hackSec / ns.weakenAnalyze(1) * 1.1);

  const multiplier = 1 / (1 - hackFrac);
  const growThreads = Math.ceil(ns.growthAnalyze(target.hostname, multiplier) * 1.1);
  const growSec = ns.growthAnalyzeSecurity(growThreads);
  const growWeakenThreads = Math.ceil(growSec / ns.weakenAnalyze(1) * 1.1);

  return {
    hackThreads,
    hackWeakenThreads,
    growThreads,
    growWeakenThreads,
  };
}

/**
 * Calculates thread requirements to execute a single HWGW cycle.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object} target - Target server object.
 * @param {number} [hackPercentage=10] - Desired hack percentage.
 * @param {number} [limit=undefined] - Optional thread cap.
 * @returns {{ hackThreads: number, hackWeakenThreads: number, growThreads: number, growWeakenThreads: number }}
 */
function calculateHackThreads(ns, target, hackPercentage = 10, limit = undefined) {
  if (limit === 0) {
    return {
      hackThreads: 0,
      hackWeakenThreads: 0,
      growThreads: 0,
      growWeakenThreads: 0,
    };
  }

  const hackFrac = hackPercentage / 100;
  let hackThreads = Math.floor(hackFrac / ns.hackAnalyze(target.hostname));
  const hackSec = ns.hackAnalyzeSecurity(hackThreads);
  let hackWeakenThreads = Math.ceil(hackSec / ns.weakenAnalyze(1) * 1.1);

  const multiplier = 1 / (1 - hackFrac);
  let growThreads = Math.ceil(ns.growthAnalyze(target.hostname, multiplier) * 1.1);
  const growSec = ns.growthAnalyzeSecurity(growThreads);
  let growWeakenThreads = Math.ceil(growSec / ns.weakenAnalyze(1) * 1.1);

  const totalThreads = hackThreads + hackWeakenThreads + growThreads + growWeakenThreads;

  if (limit !== undefined && totalThreads > limit) {
    return optimizeHackAllocation(ns, target, hackPercentage, limit);
  }

  return {
    hackThreads,
    hackWeakenThreads,
    growThreads,
    growWeakenThreads,
  };
}

/**
 * Dispatches thread count calculation for a target based on its status.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object} target - Target server object.
 * @param {number} [hackPercentage=10]
 * @param {number} [limit=undefined]
 * @returns {{ hackThreads: number, hackWeakenThreads: number, growThreads: number, growWeakenThreads: number }}
 */
export function calculateThreadCounts(ns, target, hackPercentage = 10, limit = undefined) {
  switch (target.status) {
    case "hack":
      return calculateHackThreads(ns, target, hackPercentage, limit);
    default:
      return {
        hackThreads: 0,
        hackWeakenThreads: 0,
        growThreads: 0,
        growWeakenThreads: 0,
      };
  }
}
