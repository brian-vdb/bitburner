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
  // Set executionEndTime to the highest maxTime among targets.
  const executionEndTime = Math.max(...targets.map(target => target.maxTime));

  let executionStartTime;
  // Filter hack targets (status equals "hack")
  const hackTargets = targets.filter(target => target.status === "hack");

  if (hackTargets.length > 0) {
    // Use the lowest minTime among hack targets.
    const lowestMinTime = Math.min(...hackTargets.map(target => target.minTime));
    executionStartTime = executionEndTime - lowestMinTime - (3 * hackInterval);
  } else {
    // Check if there is a grow target.
    const growTargets = targets.filter(target => target.status === "grow");
    if (growTargets.length > 0 && hackInterval !== undefined) {
      executionStartTime = executionEndTime - (3 * hackInterval);
    } else {
      executionStartTime = executionEndTime;
    }
  }

  // Initialize events as a SortedEventList instance with the optional initial events.
  return {
    executionStartTime, executionEndTime,
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
  // Get the thread counts for heal (combined weaken and grow).
  const { weakenThreads, growThreads, hackThreads } = calculateThreadCounts(ns, target, target.threadsAssigned);

  // Calculate the weaken start time.
  const weakenStartTime = (target.weakenTime >= batch.executionTimeframe + hackInterval)
    ? (batch.executionEndTime - target.weakenTime)
    : (batch.executionStartTime - hackInterval);
  
  // Calculate the grow start time.
  const growStartTime = (target.growTime >= weakenStartTime + target.weakenTime - batch.executionStartTime + 4 * hackInterval)
    ? (weakenStartTime + target.weakenTime - target.growTime - 3 * hackInterval)
    : (batch.executionStartTime - hackInterval);

  // Create events for weaken and grow actions if thread counts are positive.
  let events = [];
  if (weakenThreads > 0) {
    events.push({
      time: Math.round(weakenStartTime),
      target: target.hostname,
      action: 'weaken',
      threads: weakenThreads
    });
  }
  if (growThreads > 0) {
    events.push({
      time: Math.round(growStartTime),
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
