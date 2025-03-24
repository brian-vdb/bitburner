/*
  Brian van den Berg
  Module: BatchAnalysis
  File: allocation.js
  Description: Functions related to the allocation of threads to targets.
*/

import { calculateThreadCounts } from "./threads";

/**
 * Assigns threads from hosts to targets
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
      // Ensure threadsAssigned is defined
      target.threadsAssigned ??= 0;

      // Only calculate threadsNeeded if not already defined
      if (target.threadsNeeded === undefined) {
        const threadCounts = calculateThreadCounts(ns, target, undefined);
        target.threadsNeeded = threadCounts.weakenThreads + threadCounts.growThreads + threadCounts.hackThreads;
      }

      // Calculate the available threads for this target based on its proportion
      const proportionalThreads = Math.floor(
        (target.value / totalTargetsValue) * totalThreadsAvailable
      );

      // Assign the minimum of needed or available threads
      const threadsAssigned = Math.min(target.threadsNeeded - target.threadsAssigned, proportionalThreads);

      target.threadsAssigned += threadsAssigned;
      cycleThreadsAssigned += threadsAssigned;
    });

    totalThreadsAvailable -= cycleThreadsAssigned;
  } while (totalThreadsAvailable > 0 && cycleThreadsAssigned > 0);

  return targets;
}
