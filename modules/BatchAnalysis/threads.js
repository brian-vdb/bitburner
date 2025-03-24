/*
  Brian van den Berg
  Module: Threads
  File: threads.js
  Description: Centralized functions for calculating thread counts for grow and weaken actions.
*/

/**
 * Calculates the optimal allocation for grow threads and the corresponding extra weaken threads
 * (to offset security increases) given a combined thread limit
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object} target - The target object with properties such as hostname, moneyCurrent, and moneyMax
 * @param {number} combinedLimit - The maximum number of threads available for both grow and extra weaken
 * @returns {Object} An object with the optimal thread counts: { optimizedGrowThreads, optimizedGrowWeakenThreads }
 */
function optimizeGrowthAllocation(ns, target, combinedLimit) {
  // Calculate the ideal grow threads to reach maximum money.
  const multiplier = target.moneyMax / target.moneyCurrent;
  const idealGrowThreads = Math.ceil(ns.growthAnalyze(target.hostname, multiplier)) + 1;
  const idealGrowWeakenThreads = Math.ceil(ns.growthAnalyzeSecurity(idealGrowThreads) / ns.weakenAnalyze(1)) + 1;
  const idealCombined = idealGrowThreads + idealGrowWeakenThreads
  const initialGuess = idealCombined <= combinedLimit ? idealGrowThreads : combinedLimit / idealCombined * idealGrowThreads;

  // Define the cost function as the squared difference between the total threads required and the combined limit
  function cost(x) {
    if (x < 0) x = 0;
    const requiredWeaken = Math.ceil(ns.growthAnalyzeSecurity(x) / ns.weakenAnalyze(1)) + 1;
    return Math.pow(x + requiredWeaken - combinedLimit, 2);
  }

  // Gradient descent parameters
  let x = initialGuess;      // initial guess
  const alpha = 0.1;         // learning rate
  const epsilon = 0.001;     // small step for finite difference gradient estimation
  const tolerance = 0.001;   // convergence tolerance
  const maxIterations = 100;

  // Perform gradient descent to adjust the candidate grow thread count
  for (let i = 0; i < maxIterations; i++) {
    const grad = (cost(x + epsilon) - cost(x - epsilon)) / (2 * epsilon);
    x = x - alpha * grad;
    if (Math.abs(grad) < tolerance) break;
  }

  // Calculate the optimized grow / weaken threads
  let optimizedGrowThreads = Math.floor(x) - 1;
  if (optimizedGrowThreads < 0) optimizedGrowThreads = 0;
  let optimizedGrowWeakenThreads = Math.ceil(ns.growthAnalyzeSecurity(optimizedGrowThreads) / ns.weakenAnalyze(1)) + 1;

  return { optimizedGrowThreads, optimizedGrowWeakenThreads };
}

/**
 * Calculates the required thread counts for a given target
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object} target - The target object with properties
 * 
 * @returns {Object} For a target: { weakenThreads: number, growThreads: number, hackThreads: number }
 */
export function calculateThreadCounts(ns, target, limit = undefined) {
  switch (target.status) {
    case 'heal': {
      // Calculate base weaken threads required.
      const securityGap = target.securityCurrent - target.securityMin;
      let weakenThreads = Math.ceil(securityGap / ns.weakenAnalyze(1)) + 1;

      // Return the weaken threads if that's the only thing that fits.
      if (limit && limit < weakenThreads) return {
        weakenThreads: limit,
        growThreads: 0,
        hackThreads: 0
      };

      // Calculate base grow threads required.
      const multiplier = target.moneyMax / target.moneyCurrent;
      let growThreads = Math.ceil(ns.growthAnalyze(target.hostname, multiplier)) + 1;

      // Calculate the security increase from growing and the associated weaken threads needed.
      const securityIncrease = ns.growthAnalyzeSecurity(growThreads);
      let growWeakenThreads = Math.ceil(securityIncrease / ns.weakenAnalyze(1)) + 1;

      // Scale the threads if there aren't enough threads available
      if (limit && limit < weakenThreads + growThreads + growWeakenThreads) {
        // Calculate the available threads for the growth phase.
        const combinedLimit = limit - weakenThreads;

        // Use gradient descent to find the optimal allocation for grow and its weaken threads.
        const { optimizedGrowThreads, optimizedGrowWeakenThreads } = optimizeGrowthAllocation(ns, target, combinedLimit);
        growThreads = optimizedGrowThreads;
        growWeakenThreads = optimizedGrowWeakenThreads;
      }
      
      return {
        weakenThreads: weakenThreads + growWeakenThreads,
        growThreads,
        hackThreads: 0
      };
    }
    default:
      return {
        weakenThreads: 0,
        growThreads: 0,
        hackThreads: 0
      };
  }
}
