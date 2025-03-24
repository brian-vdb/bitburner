/*
  Brian van den Berg
  Module: BatchExecution
  File: events.js
  Description: Functions related to the firing of events.
*/

import { weaken as runWeaken, grow as runGrow, hack as runHack } from "../../network/hack";

/**
 * Allocates the required number of threads for an event among the available hosts.
 *
 * @param {Object} event - The event for which to allocate threads. Must have a property `threads` indicating the required threads.
 * @param {Object[]} hosts - The array of host objects available for running the event. Each host object should include `hostname` and `threadsAvailable`.
 * @returns {Object[]} An array of allocation objects in the format: { hostname: string, threads: number }.
 */
export function allocateEventThreads(event, hosts) {
  let requiredThreads = event.threads;
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
 * @param {Object[]} allocation - An array of allocation objects in the format: { hostname: string, threads: number }.
 * @param {Object[]} hosts - The original array of host objects.
 * @returns {Object[]} The updated hosts array with the allocated threads deducted.
 */
export function deductAllocation(allocation, hosts) {
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
const eventHandlers = {
  /**
   * Handles a "weaken" event.
   *
   * @param {import("../../index").NS} ns - The Bitburner environment object.
   * @param {Object} event - The event object. Must include `threads` and `target` properties.
   * @param {Object[]} hosts - Array of host objects.
   * @returns {Object[]} The updated hosts array after deducting used threads.
   */
  weaken: (ns, event, hosts) => {
    const allocation = allocateEventThreads(event, hosts);
    allocation.forEach(alloc => {
      const success = runWeaken(ns, alloc.hostname, event.target, alloc.threads);
    });
    return deductAllocation(allocation, hosts);
  },
  /**
   * Handles a "grow" event.
   *
   * @param {import("../../index").NS} ns - The Bitburner environment object.
   * @param {Object} event - The event object. Must include `threads` and `target` properties.
   * @param {Object[]} hosts - Array of host objects.
   * @returns {Object[]} The updated hosts array after deducting used threads.
   */
  grow: (ns, event, hosts) => {
    const allocation = allocateEventThreads(event, hosts);
    allocation.forEach(alloc => {
      const success = runGrow(ns, alloc.hostname, event.target, alloc.threads);
    });
    return deductAllocation(allocation, hosts);
  },
  /**
   * Handles a "hack" event.
   *
   * @param {import("../../index").NS} ns - The Bitburner environment object.
   * @param {Object} event - The event object. Must include `threads` and `target` properties.
   * @param {Object[]} hosts - Array of host objects.
   * @returns {Object[]} The updated hosts array after deducting used threads.
   */
  hack: (ns, event, hosts) => {
    const allocation = allocateEventThreads(event, hosts);
    allocation.forEach(alloc => {
      const success = runHack(ns, alloc.hostname, event.target, alloc.threads);
    });
    return deductAllocation(allocation, hosts);
  }
};

/**
 * Handles an event based on its action, assigns hosts for execution, and returns an updated hosts array.
 *
 * @param {import("../../index").NS} ns - The Bitburner environment object.
 * @param {Object} event - The event to be handled. Must include `action`, `target`, and `threads` properties.
 * @param {Object[]} hosts - An array of host objects available for running the event.
 * @returns {Object[]} The updated hosts array after handling the event.
 */
export function handleEvent(ns, event, hosts) {
  if (eventHandlers[event.action]) {
    return eventHandlers[event.action](ns, event, hosts);
  } else {
    ns.tprint(`Unknown action "${event.action}" for target ${event.target}.`);
    return hosts;
  }
}
