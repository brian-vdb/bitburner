/*
  Brian van den Berg
  Module: ExtractionOrchestratedHack
  File: threads.js
  Description: Centralized functions for calculating thread counts for hack operations.
*/

/**
 * Calculates thread requirements for a hack cycle.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object} target - Target object.
 * @param {number} [hackPercentage=10] - Percentage of money to hack.
 * @param {number} [limit] - Optional thread cap.
 * @returns {{ hackThreads: number }} Thread count object.
 */
function calculateHackThreads(ns, target, hackPercentage = 10, limit) {
  const fraction = hackPercentage / 100;
  const moneyToHack = target.moneyMax * fraction;

  let hackThreads = Math.floor(ns.hackAnalyzeThreads(target.hostname, moneyToHack));
  if (limit !== undefined && hackThreads > limit) {
    hackThreads = limit;
  }

  return { hackThreads };
}

/**
 * Dispatches thread count calculation based on target status.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object} target - Target object.
 * @param {number} [hackPercentage=10] - Percentage of money to hack.
 * @param {number} [limit] - Optional thread cap.
 * @returns {{ hackThreads: number }} Thread count result.
 */
export function calculateThreadCounts(ns, target, hackPercentage = 10, limit) {
  switch (target.status) {
    case "hack":
      return calculateHackThreads(ns, target, hackPercentage, limit);
    default:
      return { hackThreads: 0 };
  }
}
