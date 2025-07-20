/*
  Brian van den Berg
  Module: ExtractionOrchestratedHack
  File: allocation.js
  Description: Functions related to the allocation of threads to targets for hacking.
*/

import { calculateThreadCounts } from "./threads";

/**
 * Filters out non-hack targets and sorts them by descending value.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object[]} targets - Array of target objects.
 * @param {number} [hackPercentage=10] - Hack percentage to apply.
 * @returns {Object[]} Sorted and updated target list.
 */
export function calculateAndSortTargets(ns, targets, hackPercentage = 10) {
  targets = targets.filter(t => t.status === "hack");

  for (const target of targets) {
    const tc = calculateThreadCounts(ns, target, hackPercentage);
    target.threadsNeeded = tc.hackThreads;
  }

  return targets.sort((a, b) => b.value - a.value);
}

/**
 * Assigns available threads across all targets proportionally by value.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment object.
 * @param {Object[]} hosts - Host machines with threadsAvailable.
 * @param {Object[]} targets - Prepared target objects.
 * @param {number} [hackPercentage=10] - Hack percentage to apply.
 * @returns {Object[]} Updated targets with threadsAssigned field.
 */
export function assignThreads(ns, hosts, targets, hackPercentage = 10) {
  targets = calculateAndSortTargets(ns, targets, hackPercentage);
  targets.forEach(t => t.threadsAssigned = 0);

  let total = hosts.reduce((sum, h) => sum + h.threadsAvailable, 0);

  let didAssign;
  do {
    didAssign = 0;

    const active = targets.filter(t => t.threadsAssigned < t.threadsNeeded);
    const valueSum = active.reduce((sum, t) => sum + t.value, 0);

    for (const target of active) {
      const want = target.threadsNeeded - target.threadsAssigned;
      const shareRatio = Math.floor((target.value / valueSum) * total);
      const assign = Math.min(want, shareRatio);
      target.threadsAssigned += assign;
      total -= assign;
      didAssign += assign;
    }

  } while (total > 0 && didAssign > 0);

  return targets;
}
