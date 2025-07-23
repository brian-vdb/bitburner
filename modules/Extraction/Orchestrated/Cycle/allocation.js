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
 * @returns {{ targets: Object[], hosts: Object[] }}
 */
export function assignThreads(ns, hosts, targets, hackPercentage) {
  targets = calculateAndSortTargets(ns, targets, hackPercentage);

  targets.forEach(t => {
    if (t.threadsAssigned === undefined) t.threadsAssigned = 0;
  });

  hosts.forEach(h => {
    if (h.threadsAssigned === undefined) h.threadsAssigned = 0;
  });

  let didAssign;

  do {
    didAssign = 0;
    for (const target of targets) {
      let want = target.threadsNeeded - target.threadsAssigned;
      if (want <= 0) continue;

      for (const host of hosts) {
        const hostFree = host.maxThreadsAvailable - host.threadsAssigned;
        if (hostFree <= 0) continue;

        const toAssign = Math.min(want, hostFree);
        target.threadsAssigned += toAssign;
        host.threadsAssigned += toAssign;
        didAssign += toAssign;
        want -= toAssign;

        if (want <= 0) break;
      }
    }
  } while (didAssign > 0);

  return { targets, hosts };
}
