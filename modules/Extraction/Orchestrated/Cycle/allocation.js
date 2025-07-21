/*
  Brian van den Berg
  Module: ExtractionOrchestratedCycle
  File: allocation.js
  Description: Functions to assign threads to hack-cycle targets.
*/

import { calculateThreadCounts } from "./threads";

/**
 * Filters and prioritizes targets for HWGW batching.
 *
 * @param {import("../../../../index").NS} ns
 * @param {Object[]} targets
 * @param {number} hackPercentage
 * @param {number} [maxTargets=25]
 * @returns {Object[]}
 */
export function calculateAndSortTargets(ns, targets, hackPercentage, maxTargets = 25) {
  targets = targets.filter(t => t.status === "hack");

  for (const target of targets) {
    const tc = calculateThreadCounts(ns, target, hackPercentage);
    target.threadsNeeded = tc.hackThreads + tc.hackWeakenThreads + tc.growThreads + tc.growWeakenThreads;
  }

  return targets.sort((a, b) => b.value - a.value).slice(0, maxTargets);
}

/**
 * Fairly assigns threads across selected hack targets.
 *
 * @param {import("../../../../index").NS} ns
 * @param {Object[]} hosts
 * @param {Object[]} targets
 * @param {number} hackPercentage
 * @returns {Object[]}
 */
export function assignThreads(ns, hosts, targets, hackPercentage) {
  targets = calculateAndSortTargets(ns, targets, hackPercentage);
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
