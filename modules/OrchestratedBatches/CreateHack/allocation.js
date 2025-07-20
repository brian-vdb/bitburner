/*
  Brian van den Berg
  Module: CreateHack
  File: allocation.js
  Description: Functions related to the allocation of threads to targets.
*/

import { calculateThreadCounts } from "./threads";

/**
 * Calculates thread counts for each target and sorts/ filters targets.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {Object[]} targets - The collection of targets from server analysis.
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @returns {Object[]} Sorted targets array with updated threadsNeeded property.
 */
export function calculateAndSortTargets(ns, targets, hackPercentage=10) {
  // Filter out targets with status 'heal'.
  targets = targets.filter(target => target.status !== 'heal');

  // Calculate threads needed for each target.
  targets.forEach(target => {
    const threadCounts = calculateThreadCounts(ns, target, hackPercentage, undefined);
    target.threadsNeeded = threadCounts.hackThreads;
  });

  // Sort targets by target.value descending.
  return targets.sort((a, b) => b.value - a.value);
}

/**
 * Assigns threads from hosts to targets.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {Object[]} hosts - The collection of hosts from server analysis.
 * @param {Object[]} targets - The collection of targets from server analysis.
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @returns {Object[]} Targets with threads assigned to them.
 */
export function assignThreads(ns, hosts, targets, hackPercentage=10) {
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
    // Only consider targets that still need threads.
    const activeTargets = targets.filter(target => target.threadsNeeded > target.threadsAssigned);

    // Recalculate total value only for active targets.
    const totalActiveValue = activeTargets.reduce((sum, target) => sum + target.value, 0);

    activeTargets.forEach(target => {
      // Calculate the available threads for this target based on its proportion of the active total value.
      const proportionalThreads = Math.floor(
        (target.value / totalActiveValue) * totalThreadsAvailable
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
