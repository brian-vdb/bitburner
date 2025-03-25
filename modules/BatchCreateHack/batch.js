/*
  Brian van den Berg
  Module: BatchCreateHack
  File: batch.js
  Description: Functions related to the creation of a batch of attacks
*/

import { calculateThreadCounts } from "./threads";

export class SortedEventList {
  /**
   * Constructs a SortedEventList
   * @param {Object[]} [initialEvents=[]] - Optional initial array of events
   */
  constructor(initialEvents = []) {
    // Initialize the events array with the provided initial events
    this.events = Array.isArray(initialEvents) ? initialEvents : [];

    // Mark as unsorted so that sorting happens on first access
    this.isSorted = false;
  }

  // Adds a new event to the list and marks the list as unsorted
  enqueue(event) {
    this.events.push(event);
    this.isSorted = false;
  }

  // Sorts the events by their time property if the array is not sorted
  sortEvents() {
    if (!this.isSorted) {
      this.events.sort((a, b) => a.time - b.time);
      this.isSorted = true;
    }
  }

  // Removes and returns the event with the lowest time
  dequeue() {
    this.sortEvents();
    return this.events.shift();
  }

  // Returns the event with the lowest time without removing it
  peek() {
    this.sortEvents();
    return this.events[0];
  }

  // Returns the number of events
  size() {
    return this.events.length;
  }

  // Getter that returns the sorted events array
  get eventsArray() {
    this.sortEvents();
    return this.events;
  }
}

/**
 * Prepares the timeframe for a batch of attacks on the targets
 *
 * @param {Object[]} targets - The collection of target objects
 * @returns {Object} An object containing executionStartTime, executionEndTime, and a SortedEventList for events
 */
export function prepareBatch(targets) {
  // Set the initial execution window variables
  let schedulingEndTime = 0;
  let executionStartTime = 0;
  let executionEndTime = 0;

  // Set the execution window according to hack targets
  const hackTargets = targets.filter(target => target.status === "hack");
  if (hackTargets.length > 0) {
    executionStartTime = Math.max(...hackTargets.map(target => target.hackTime));
    executionEndTime = executionStartTime;
  }
  
  // Initialize events as a SortedEventList instance with the optional initial events
  return {
    schedulingEndTime,
    executionStartTime, executionEndTime, executionTimeFrame: executionEndTime - executionStartTime,
    events: new SortedEventList()
  };
}

/**
 * Creates hack events for a target
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object} target - The target object
 * @param {Object} batch - The batch object containing executionStartTime, executionEndTime, etc.
 * @param {number} [hackPercentage=10] - The hack percentage
 * @returns {Object[]} An array of event objects for heal actions (weaken and grow), or an empty array if no threads are allocated
 */
function createHackEvents(ns, target, batch, hackPercentage=10) {
  let events = [];

  // Get the thread counts for hack
  const { hackThreads } = calculateThreadCounts(ns, target, hackPercentage, target.threadsAssigned);
  
  if (hackThreads > 0) {
    // Calculate the hack start time
    const hackStartTime = batch.executionStartTime - target.hackTime;
    
    // Create the grow event
    events.push({
      time: hackStartTime,
      target: target.hostname,
      action: 'hack',
      threads: hackThreads
    });
  }

  return events;
}

/**
 * Prepares the batch events for a target
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object} target - The target object for which to create batch events
 * @param {Object} batch - The batch object
 * @param {number} [hackPercentage=10] - The hack percentage
 * @returns {Object[]} An array of event objects created for the target
 */
function getTargetEvents(ns, target, batch, hackPercentage=10) {
  switch (target.status) {
    case 'hack':
      return createHackEvents(ns, target, batch, hackPercentage);
    default:
      return [];
  }
}

/**
 * Populates the batch with events for all targets
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object[]} targets - The collection of target objects to process
 * @param {Object} batch - The batch object
 * @param {number} [hackPercentage=10] - The hack percentage
 * @returns {Object} The updated batch object with events populated for all targets
 */
export function populateBatch(ns, targets, batch, hackPercentage=10) {
  targets.forEach(target => {
    const targetEvents = getTargetEvents(ns, target, batch, hackPercentage);
    targetEvents.forEach(event => {
      batch.events.enqueue(event);
    });
  });
  return batch;
}
