/*
  Brian van den Berg
  Module: ExtractionOrchestratedExecution
  File: events.js
  Description: Functions related to the firing of events.
*/

import { weaken, grow, hack } from "./hack";

/**
 * Returns the highest count of thread actions in a batch set.
 *
 * @param {Object<string, Object>} batches - Object mapping hostnames to batch objects.
 * @returns {number} The highest number of thread events in any batch.
 */
export function getHighestThreadCount(batches) {
  let highestCount = 0;
  for (const batch of Object.values(batches)) {
    if (batch.threads && batch.threads.length > highestCount) {
      highestCount = batch.threads.length;
    }
  }
  return highestCount;
}

/**
 * Allocates threads for a thread event from available hosts.
 *
 * @param {Object} threads - Thread event object { action, amount, additionalMsec }.
 * @param {Object[]} hosts - Hosts with available threads.
 * @param {string} target - Target server name.
 * @returns {Object[]} Array of allocations or empty array if allocation fails.
 */
export function createAllocation(threads, hosts, target) {
  let threadsRequired = threads.amount;
  const totalRequired = threadsRequired;
  let totalAllocated = 0;
  const allocation = [];

  for (let i = 0; i < hosts.length && threadsRequired > 0; ) {
    const host = hosts[i];
    const threadsAllocated = Math.min(host.threadsAvailable, threadsRequired);

    if (threadsAllocated > 0) {
      allocation.push({
        action: threads.action,
        hostname: host.hostname,
        target: target,
        threads: threadsAllocated,
        additionalMsec: threads.additionalMsec
      });

      host.threadsAvailable -= threadsAllocated;
      threadsRequired -= threadsAllocated;
      totalAllocated += threadsAllocated;
    }

    if (host.threadsAvailable <= 0) {
      hosts.splice(i, 1);
    } else {
      i++;
    }
  }

  return totalAllocated === totalRequired ? allocation : [];
}

/**
 * Executes a list of allocated threads by dispatching the correct script.
 *
 * @param {import("../../../../index").NS} ns - Bitburner environment.
 * @param {Object[]} allocation - Array of allocated thread objects.
 */
export function executeAllocation(ns, allocation) {
  const handlers = {
    weaken: (a) => weaken(ns, a.hostname, a.target, a.threads, a.additionalMsec),
    grow:   (a) => grow(ns, a.hostname, a.target, a.threads, a.additionalMsec),
    hack:   (a) => hack(ns, a.hostname, a.target, a.threads, a.additionalMsec)
  };

  for (const alloc of allocation) {
    handlers[alloc.action]?.(alloc);
  }
}
