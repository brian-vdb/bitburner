/*
  Brian van den Berg
  Module: BatchExecution
  File: events.js
  Description: Functions related to the firing of events.
*/

import { weaken, grow, hack } from "../../network/hack";

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
 * @returns {Object[]} Collection of thread allocations.
 */
function allocateEventThreads(threads, hosts) {
  let requiredThreads = threads.amount;
  const allocation = [];

  // Loop over the hosts array and allocate threads.
  for (let i = 0; i < hosts.length && requiredThreads > 0; i++) {
    const host = hosts[i];
    // Allocate as many threads as possible from this host.
    const threadsAllocated = Math.min(host.threadsAvailable, requiredThreads);
    if (threadsAllocated > 0) allocation.push({ hostname: host.hostname, threads: threadsAllocated });
    requiredThreads -= threadsAllocated;
  }

  return allocation;
}

/**
 * Deducts the allocated threads from the hosts array and returns the updated hosts array.
 *
 * @param {Object[]} allocation - Collection of thread allocations.
 * @param {Object[]} hosts - Collection of host objects.
 * @returns {Object[]} The updated hosts array after deducting used threads.
 */
function deductAllocation(allocation, hosts) {
  allocation.forEach(alloc => {
    const idx = hosts.findIndex(h => h.hostname === alloc.hostname);
    if (idx !== -1) {
      hosts[idx].threadsAvailable -= alloc.threads;
      if (hosts[idx].threadsAvailable <= 0) {
        hosts.splice(idx, 1);
      }
    }
  });
  return hosts;
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
   * @param {Object} threadsObj - The threads object that contains information about the hack.
   * @param {Object[]} hosts - Collection of host objects.
   * @returns {Object[]} The updated hosts array after deducting used threads.
   */
  'weaken': (ns, target, threadsObj, hosts) => {
    const allocation = allocateEventThreads(threadsObj, hosts);
    allocation.forEach(alloc => {
      const success = weaken(ns, alloc.hostname, target, alloc.threads, threadsObj.additionalMsec);
    });
    return deductAllocation(allocation, hosts);
  },
  /**
   * Handles a "grow" event.
   *
   * @param {import("../../index").NS} ns - The Bitburner environment object.
   * @param {Object} threadsObj - The threads object that contains information about the hack.
   * @param {Object[]} hosts - Collection of host objects.
   * @returns {Object[]} The updated hosts array after deducting used threads.
   */
  'grow': (ns, target, threadsObj, hosts) => {
    const allocation = allocateEventThreads(threadsObj, hosts);
    allocation.forEach(alloc => {
      const success = grow(ns, alloc.hostname, target, alloc.threads, threadsObj.additionalMsec);
    });
    return deductAllocation(allocation, hosts);
  },
  /**
   * Handles a "hack" event.
   *
   * @param {import("../../index").NS} ns - The Bitburner environment object.
   * @param {Object} threadsObj - The threads object that contains information about the hack.
   * @param {Object[]} hosts - Collection of host objects.
   * @returns {Object[]} The updated hosts array after deducting used threads.
   */
  'hack': (ns, target, threadsObj, hosts) => {
    const allocation = allocateEventThreads(threadsObj, hosts);
    allocation.forEach(alloc => {
      const success = hack(ns, alloc.hostname, target, alloc.threads, threadsObj.additionalMsec);
    });
    return deductAllocation(allocation, hosts);
  }
};

/**
 * Handles an event based on its action, assigns hosts for execution, and returns an updated hosts array.
 *
 * @param {import("../../index").NS} ns - The Bitburner environment object.
 * @param {Object} threads - The collection of threads objects that contain information about the batch.
 * @param {Object[]} hosts - Collection of host objects.
 * @returns {Object[]} The updated hosts array after handling the event.
 */
export function handleThreads(ns, target, threads, hosts) {
  for (const threadsObj of threads) {
    hosts = threadsHandlers[threadsObj.action](ns, target, threadsObj, hosts);
  }
  return hosts;
}
