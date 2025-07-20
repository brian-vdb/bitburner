/*
  Brian van den Berg
  Module: ExtractionOrchestratedHeal
  File: allocation.js
  Description: Functions related to the allocation of threads to targets for healing.
*/

import { calculateThreadCounts } from "./threads";

/**
 * Filters out non-heal targets and sorts them based on efficiency (time × threads).
 *
 * @param {import("../../../../index").NS} ns - The environment object.
 * @param {Object[]} targets - Array of target objects.
 * @returns {Object[]} Sorted and updated target list.
 */
export function calculateAndSortTargets(ns, targets) {
  targets = targets.filter(t => t.status !== "hack");

  for (const target of targets) {
    const tc = calculateThreadCounts(ns, target);
    target.threadsNeeded = tc.weakenThreads + tc.growThreads + tc.growWeakenThreads;
  }

  return targets.sort((a, b) => a.maxTime * a.threadsNeeded - b.maxTime * b.threadsNeeded);
}

/**
 * Assigns available threads across all targets in a fair and balanced loop.
 *
 * @param {import("../../../../index").NS} ns - The environment object.
 * @param {Object[]} hosts - Host machines with maxThreadsAvailable.
 * @param {Object[]} targets - Prepared target objects.
 * @returns {Object[]} Updated targets with threadsAssigned field.
 */
export function assignThreads(ns, hosts, targets) {
  targets = calculateAndSortTargets(ns, targets);
  targets.forEach(t => t.threadsAssigned = 0);

  let total = hosts.reduce((sum, h) => sum + h.maxThreadsAvailable, 0);

  let didAssign;
  do {
    didAssign = 0;
    for (const target of targets) {
      const want = target.threadsNeeded - target.threadsAssigned;
      const canAssign = Math.min(want, total);
      target.threadsAssigned += canAssign;
      total -= canAssign;
      didAssign += canAssign;
    }
  } while (total > 0 && didAssign > 0);

  return targets;
}
