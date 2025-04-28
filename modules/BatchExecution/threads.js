/*
  Brian van den Berg
  Module: BatchExecution
  File: events.js
  Description: Functions related to the firing of events.
*/

import { weaken, grow, hack } from "./hack";

/**
 * Returns the highest count of threads in the batch.
 *
 * @param {Array<Object>} batches - An array of batch objects, each containing a "threads" property.
 * @returns {number} The maximum number of threads in any event within the batch.
 */
export function getHighestThreadCount(batches) {
  let highestCount = 0;
  for (const batch of batches) {
    if (batch.threads && batch.threads.length > highestCount) {
      highestCount = batch.threads.length;
    }
  }
  return highestCount;
}

/**
 * Allocates the required number of threads for an event among the available hosts.
 *
 * @param {Object} threads - The threads object that contains information about the hack.
 * @param {Object[]} hosts - Collection of host objects.
 * @param {string} target - Hostname of the target of the hack.
 * @returns {Object[]} Collection of thread allocations.
 */
export function createAllocation(threads, hosts, target) {
  let threadsRequired = threads.amount;
  const totalRequired = threadsRequired;
  let totalAllocated = 0; 
  const allocation = [];

  // Iterate through hosts while there are threads required.
  for (let i = 0; i < hosts.length && threadsRequired > 0; ) {
    const host = hosts[i];

    // Determine how many threads can be allocated from this host.
    const threadsAllocated = Math.min(host.threadsAvailable, threadsRequired);
    if (threadsAllocated > 0) {
      allocation.push({
        action: threads.action,
        hostname: host.hostname,
        target: target,
        threads: threadsAllocated,
        additionalMsec: threads.additionalMsec
      });

      // Deduct threads directly from the host.
      host.threadsAvailable -= threadsAllocated;
      threadsRequired -= threadsAllocated;
      totalAllocated += threadsAllocated;
    }

    // Remove the host if no threads remain.
    if (host.threadsAvailable <= 0) {
      hosts.splice(i, 1);
    } else {
      i++;
    }
  }

  return totalAllocated === totalRequired ? allocation : [];
}

/**
 * Event handlers mapping.
 *
 * @type {Object.<string, function(import("../../index").NS, Object, Object[]): Object[]>}
 */
const threadsHandlers = {
  /**
   * Handles a "weaken" event.
   *
   * @param {import("../../index").NS} ns - The Bitburner environment object.
   * @param {Object[]} alloc - Thread allocation.
   * @returns {void}
   */
  'weaken': (ns, alloc) => {
    weaken(ns, alloc.hostname, alloc.target, alloc.threads, alloc.additionalMsec);
  },
  /**
   * Handles a "grow" event.
   *
   * @param {import("../../index").NS} ns - The Bitburner environment object.
   * @param {Object[]} alloc - Thread allocation.
   * @returns {void}
   */
  'grow': (ns, alloc) => {
    grow(ns, alloc.hostname, alloc.target, alloc.threads, alloc.additionalMsec);
  },
  /**
   * Handles a "hack" event.
   *
   * @param {import("../../index").NS} ns - The Bitburner environment object.
   * @param {Object[]} alloc - Thread allocation.
   * @returns {void}
   */
  'hack': (ns, alloc) => {
    hack(ns, alloc.hostname, alloc.target, alloc.threads, alloc.additionalMsec);
  }
};

/**
 * Handles an allocation of threads.
 *
 * @param {import("../../index").NS} ns - The Bitburner environment object.
 * @param {Object[]} allocation - Collection of thread allocations.
 * @returns {void}
 */
export function executeAllocation(ns, allocation) {
  for (const alloc of allocation) {
    threadsHandlers[alloc.action](ns, alloc);
  }
}
