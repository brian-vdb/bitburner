/*
  Brian van den Berg
  Module: BatchCreateHack
  File: threads.js
  Description: Centralized functions for calculating thread counts for hack actions
*/

/**
 * Calculates the required thread counts for hacking a target
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object} target - The target object with its properties
 * @param {number} [hackPercentage=10] - The hack percentage
 * @param {number} [limit=undefined] - Optional limit on the total available threads
 * @returns {Object} An object with thread counts: { weakenThreads, growThreads, hackThreads }
 */
function calculateHackThreads(ns, target, hackPercentage=10, limit = undefined) {
  // Convert hackPercentage from percent to fraction
  const fraction = hackPercentage / 100;

  // Calculate hack threads needed to steal 'fraction' of target.moneyMax
  const moneyToHack = target.moneyMax * fraction;
  let hackThreads = Math.floor(ns.hackAnalyzeThreads(target.hostname, moneyToHack));

  // If a thread limit is provided and the total required exceeds it, scale the threads down
  if (limit && limit < hackThreads) {
    hackThreads = limit;
  }

  // Return the composed thread counts
  return {
    hackThreads: hackThreads
  };
}

/**
 * Calculates the required thread counts for a given target based on its status
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object} target - The target object with its properties
 * @param {number} [hackPercentage=10] - The hack percentage
 * @param {number} [limit=undefined] - Optional limit on the total available threads
 * @returns {Object} An object with thread counts: { weakenThreads, growThreads, hackThreads }
 */
export function calculateThreadCounts(ns, target, hackPercentage=10, limit=undefined) {
  switch (target.status) {
    case 'hack':
      return calculateHackThreads(ns, target, hackPercentage, limit);
    default:
      return {
        hackThreads: 0
      };
  }
}
