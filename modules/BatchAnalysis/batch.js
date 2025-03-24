/*
  Brian van den Berg
  Module: BatchAnalysis
  File: batch.js
  Description: Functions related to the creation of a batch of attacks.
*/

import { calculateThreadCounts } from "./threads";

export class SortedEventList {
  /**
   * Constructs a SortedEventList.
   * @param {Object[]} [initialEvents=[]] - Optional initial array of events.
   */
  constructor(initialEvents = []) {
    // Initialize the events array with the provided initial events.
    this.events = Array.isArray(initialEvents) ? initialEvents : [];

    // Mark as unsorted so that sorting happens on first access.
    this.isSorted = false;
  }

  // Adds a new event to the list and marks the list as unsorted.
  enqueue(event) {
    this.events.push(event);
    this.isSorted = false;
  }

  // Sorts the events by their time property if the array is not sorted.
  sortEvents() {
    if (!this.isSorted) {
      this.events.sort((a, b) => a.time - b.time);
      this.isSorted = true;
    }
  }

  // Removes and returns the event with the lowest time.
  dequeue() {
    this.sortEvents();
    return this.events.shift();
  }

  // Returns the event with the lowest time without removing it.
  peek() {
    this.sortEvents();
    return this.events[0];
  }

  // Returns the number of events.
  size() {
    return this.events.length;
  }

  // Getter that returns the sorted events array.
  get eventsArray() {
    this.sortEvents();
    return this.events;
  }
}

/**
 * Prepares the timeframe for a batch of attacks on the targets.
 *
 * @param {Object[]} targets - The collection of target objects.
 * @param {number} hackInterval - The hack interval.
 * @returns {Object} An object containing executionStartTime, executionEndTime, and a SortedEventList for events.
 */
export function prepareBatch(targets, hackInterval) {
  // Set the initial execution window variables
  const executionStartTime = Math.max(...targets.map(target => target.maxTime));
  const schedulingEndTime = executionStartTime - hackInterval;
  let executionEndTime;

  // Set the execution end time according to the presence of hack targets
  const hackTargets = targets.filter(target => target.status === "hack");
  if (hackTargets.length > 0) {
    const highestMaxTime = Math.max(...hackTargets.map(target => target.maxTime));
    executionEndTime = schedulingEndTime + highestMaxTime;
  } else {
    executionEndTime = schedulingEndTime + 3 * hackInterval;
  }
  
  // Initialize events as a SortedEventList instance with the optional initial events.
  return {
    schedulingEndTime, executionStartTime, executionEndTime,
    executionTimeframe: executionEndTime - executionStartTime,
    events: new SortedEventList()
  };
}

/**
 * Creates heal events for a target.
 *
 * Heal events combine weaken and grow actions. This function calculates the required thread counts
 * for both actions using calculateThreadCounts, then creates separate events for each. The event timings
 * are determined based on the target's properties (weakenTime, growTime) and the batch's execution timeframe
 * and hack interval.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object} target - The target object.
 * @param {Object} batch - The batch object containing executionStartTime, executionEndTime, etc.
 * @param {number} hackInterval - The hack interval.
 * @returns {Object[]} An array of event objects for heal actions (weaken and grow), or an empty array if no threads are allocated.
 */
function createHealEvents(ns, target, batch, hackInterval) {
  let events = [];

  // Get the thread counts for heal (combined weaken and grow)
  const { weakenThreads, growThreads, hackThreads } = calculateThreadCounts(ns, target, target.threadsAssigned);
  
  if (weakenThreads > 0) {
    // Calculate the weaken start time
    const weakenStartTime = growThreads > 0 ?
      batch.executionStartTime + (3 * hackInterval) - target.weakenTime : 
      batch.executionStartTime - target.weakenTime;
    
    // Create the weaken event
    events.push({
      time: weakenStartTime,
      target: target.hostname,
      action: 'weaken',
      threads: weakenThreads
    });
  }
  
  if (growThreads > 0) {
    // Calculate the grow start time
    const growStartTime = batch.executionStartTime - target.growTime;
    
    // Create the grow event
    events.push({
      time: growStartTime,
      target: target.hostname,
      action: 'grow',
      threads: growThreads
    });
  }
  
  return events;
}

/**
 * Prepares the batch events for a target.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object} target - The target object for which to create batch events.
 * @param {Object} batch - The batch object.
 * @param {number} hackInterval - The hack interval.
 * @returns {Object[]} An array of event objects created for the target.
 */
function getTargetEvents(ns, target, batch, hackInterval) {
  switch (target.status) {
    case 'heal':
      return createHealEvents(ns, target, batch, hackInterval);
    default:
      return [];
  }
}

/**
 * Populates the batch with events for all targets.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {Object[]} targets - The collection of target objects to process.
 * @param {Object} batch - The batch object.
 * @param {number} hackInterval - The hack interval.
 * @returns {Object} The updated batch object with events populated for all targets.
 */
export function populateBatch(ns, targets, batch, hackInterval) {
  targets.forEach(target => {
    const targetEvents = getTargetEvents(ns, target, batch, hackInterval);
    targetEvents.forEach(event => {
      batch.events.enqueue(event);
    });
  });
  return batch;
}
