/*
  Brian van den Berg
  Module: CreateCycle
  File: allocation.js
  Description: Functions related to the allocation of threads to targets.
*/

import { calculateThreadCounts } from "./threads";

/**
 * Calculates thread counts for each target and sorts/ filters targets.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object[]} targets - The collection of targets from server analysis.
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @param {number} [maxTargets=25] - Max number of targets.
 * @returns {Object[]} Sorted targets array with updated threadsNeeded property.
 */
export function calculateAndSortTargets(ns, targets, hackPercentage=10, maxTargets=25) {
  // Filter out targets with status 'heal'.
  targets = targets.filter(target => target.status !== 'heal');

  // Calculate threads needed for each target.
  targets.forEach(target => {
    const threadCounts = calculateThreadCounts(ns, target, hackPercentage, undefined);
    target.threadsNeeded =
      threadCounts.hackThreads +
      threadCounts.hackWeakenThreads +
      threadCounts.growThreads +
      threadCounts.growWeakenThreads;
  });

  // Sort targets by target.value descending and limit to the top target.
  return targets.sort((a, b) => b.value - a.value).slice(0, maxTargets);
}

/**
 * Assigns threads from hosts to targets.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object[]} hosts - The collection of hosts from server analysis.
 * @param {Object[]} targets - The collection of targets from server analysis.
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @param {number} [maxTargets=25] - Max number of targets.
 * @returns {Object[]} Targets with threads assigned to them.
 */
export function assignThreads(ns, hosts, targets, hackPercentage=10, maxTargets=25) {
  // Sort (and filter) targets using calculateAndSortTargets.
  targets = calculateAndSortTargets(ns, targets, hackPercentage);

  // Ensure threadsAssigned is initialized on each target.
  targets.forEach(target => {
    target.threadsAssigned = target.threadsAssigned ?? 0;
  });

  // Calculate total available threads using reduce.
  let totalThreadsAvailable = hosts.reduce((sum, host) => sum + host.threadsAvailable, 0);

  // Perform assignment while threads remain and at least one target receives threads in a cycle.
  let cycleThreadsAssigned;
  do {
    cycleThreadsAssigned = 0;
    targets.forEach(target => {
      // Assign the maximum of needed or available threads.
      const threadsAssigned = Math.min(target.threadsNeeded - target.threadsAssigned, totalThreadsAvailable);
      target.threadsAssigned += threadsAssigned;
      totalThreadsAvailable -= threadsAssigned;
      cycleThreadsAssigned += threadsAssigned;
    });
  } while (totalThreadsAvailable > 0 && cycleThreadsAssigned > 0);

  return targets;
}
