/*
  Brian van den Berg
  Module: BatchCreateHeal
  File: batch.js
  Description: Functions related to the creation of a batch of attacks
*/

import { calculateThreadCounts } from "./threads";

export class SortedEventList {
  /**
   * Constructs a SortedEventList.
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
 * @param {number} [hackInterval=1000] - The hack interval
 * @returns {Object} An object containing executionStartTime, executionEndTime, and a SortedEventList for events
 */
export function prepareBatch(targets, hackInterval=1000) {
  // Set the initial execution window variables
  const executionStartTime = Math.max(...targets.map(target => target.maxTime));
  const schedulingEndTime = executionStartTime - hackInterval;
  const executionEndTime = schedulingEndTime + 3 * hackInterval;
  
  // Initialize events as a SortedEventList instance with the optional initial events.
  return {
    schedulingEndTime, executionStartTime, executionEndTime,
    executionTimeframe: executionEndTime - executionStartTime,
    events: new SortedEventList()
  };
}

/**
 * Creates heal events for a target with finishTime included
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {Object} target - The target object
 * @param {Object} batch - The batch object containing executionStartTime, executionEndTime, etc.
 * @param {number} [hackInterval=1000] - The hack interval
 * @returns {Object[]} An array of event objects for heal actions (weaken and grow), or an empty array if no threads are allocated
 */
function createHealEvents(ns, target, batch, hackInterval=1000) {
  let events = [];

  // Get the thread counts for heal (combined weaken and grow)
  const { weakenThreads, growThreads, growWeakenThreads } = calculateThreadCounts(ns, target, target.threadsAssigned);

  if (weakenThreads > 0) {
    // Calculate the weaken start time and pusht he weaken event
    const weakenStartTime = batch.executionStartTime - target.weakenTime;
    events.push({
      time: weakenStartTime,
      finishTime: weakenStartTime + target.weakenTime,
      target: target.hostname,
      action: 'weaken',
      threads: weakenThreads
    });
  }
  
  if (growThreads + growWeakenThreads > 0) {
    // Calculate the grow start times
    const growStartTime = batch.executionEndTime - hackInterval - target.growTime;
    const growWeakenStartTime = batch.executionEndTime - target.weakenTime;
    
    // Push the grow events
    events.push({
      time: growStartTime,
      finishTime: growStartTime + target.growTime,
      target: target.hostname,
      action: 'grow',
      threads: growThreads
    });
    events.push({
      time: growWeakenStartTime,
      finishTime: growWeakenStartTime + target.weakenTime,
      target: target.hostname,
      action: 'weaken',
      threads: growWeakenThreads
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
 * @param {number} [hackInterval=1000] - The hack interval
 * @returns {Object[]} An array of event objects created for the target
 */
function getTargetEvents(ns, target, batch, hackInterval=1000) {
  switch (target.status) {
    case 'heal':
      return createHealEvents(ns, target, batch, hackInterval);
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
 * @param {number} [hackInterval=1000] - The hack interval
 * @returns {Object} The updated batch object with events populated for all targets
 */
export function populateBatch(ns, targets, batch, hackInterval=1000) {
  targets.forEach(target => {
    const targetEvents = getTargetEvents(ns, target, batch, hackInterval);
    targetEvents.forEach(event => {
      batch.events.enqueue(event);
    });
  });
  return batch;
}

/**
 * Normalizes the batch by deducting the time until the first event is fired from
 * all event times (including finishTime) and the batch's time properties
 *
 * @param {Object} batch - The batch object containing time properties and events
 * @returns {Object} The normalized batch object
 */
export function normalizeBatch(batch) {
  // Get the first event (lowest time) from the sorted event list
  const firstEvent = batch.events.peek();
  if (!firstEvent) {
    // If there are no events, nothing to normalize
    return batch;
  }
  
  // Calculate the shift value as the time until the first event is fired
  const shift = firstEvent.time;
  
  // Deduct shift from every event's time and finishTime
  batch.events.events.forEach(event => {
    event.time -= shift;
    event.finishTime -= shift;
  });
  
  // Deduct shift from the batch's time properties
  batch.schedulingEndTime -= shift;
  batch.executionStartTime -= shift;
  batch.executionEndTime -= shift;
  batch.executionTimeframe = batch.executionEndTime - batch.executionStartTime;
  
  // Adjust the executionEndTime according to the event that finishes last
  const maxFinishTime = Math.max(...batch.events.events.map(event => event.finishTime));
  batch.executionEndTime = maxFinishTime;
  batch.executionTimeframe = batch.executionEndTime - batch.executionStartTime;
  
  return batch;
}
