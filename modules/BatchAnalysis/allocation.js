/*
  Brian van den Berg
  Module: BatchAnalysis
  File: allocation.js
  Description: Functions related to the allocation of threads to targets.
*/

/**
 * Calculates the total number of threads required for a given target.
 *
 * Depending on the target's status, this function determines whether the target
 * needs to be grown (to reach its moneyMax) or weakened (to reach its securityMin).
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object} target - The target object from server analysis.
 * @returns {number} - The total number of threads required for the target.
 */
function getTotalRequiredThreads(ns, target) {
  switch (target.status) {
    case 'weaken': {
      // Calculate the gap in security and determine weaken threads required.
      const securityGap = target.securityCurrent - target.securityMin;
      return Math.ceil(securityGap / ns.weakenAnalyze(1));
    }
    case 'grow': {
      // If target's money is already at or above max, no grow threads are needed.
      if (target.moneyCurrent >= target.moneyMax) return 0;

      // Calculate the number of grow threads needed using Bitburner's growthAnalyze.
      const multiplier = target.moneyMax / target.moneyCurrent;
      const growThreads = Math.ceil(ns.growthAnalyze(target.hostname, multiplier));

      // Determine the number of weaken threads required to offset that security increase.
      const securityIncrease = ns.growthAnalyzeSecurity(growThreads);
      const weakenThreadsForGrow = Math.ceil(securityIncrease / ns.weakenAnalyze(1));

      // Return the total threads required: grow threads + weaken threads to offset security.
      return growThreads + weakenThreadsForGrow;
    }
    default:
      return 0;
  }
}

/**
 * Assigns threads from hosts to targets.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object[]} hosts - The collection of hosts from server analysis.
 * @param {Object[]} targets - The collection of targets from server analysis.
 * @returns {Object[]} Targets with threads assigned to them.
 */
export function assignThreads(ns, hosts, targets) {
  // Calculate total available threads and total target value using reduce.
  let totalThreadsAvailable = hosts.reduce((sum, host) => sum + host.threadsAvailable, 0);
  const totalTargetsValue = targets.reduce((sum, target) => sum + target.value, 0);

  // Perform assignment while threads remain and at least one target receives threads in a cycle.
  let cycleThreadsAssigned;
  do {
    cycleThreadsAssigned = 0;
    targets.forEach(target => {
      // Ensure threadsAssigned and threadsNeeded is defined.
      target.threadsAssigned ??= 0;
      target.threadsNeeded ??= getTotalRequiredThreads(ns, target);

      // Calculate the available threads for this target based on its proportion.
      const proportionalThreads = Math.floor(
        (target.value / totalTargetsValue) * totalThreadsAvailable
      );
      // Assign the minimum of needed or available threads.
      const threadsAssigned = Math.min(target.threadsNeeded - target.threadsAssigned, proportionalThreads);

      target.threadsAssigned += threadsAssigned;
      cycleThreadsAssigned += threadsAssigned;
    });

    totalThreadsAvailable -= cycleThreadsAssigned;
  } while (totalThreadsAvailable > 0 && cycleThreadsAssigned > 0);

  return targets;
}
