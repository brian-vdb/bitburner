/*
  Brian van den Berg
  File: batch.js
  Description: Components for working with batches
*/

/**
 * Class representing a sorted list of events
 * Events are automatically sorted by their "time" property when accessed
 */
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

  /**
   * Adds a new event to the list
   * Marks the list as unsorted so that it will be re-sorted on the next access
   *
   * @param {Object} event - The event object to add.
   */
  enqueue(event) {
    this.events.push(event);
    this.isSorted = false;
  }

  /**
   * Sorts the events array in ascending order based on the "time" property
   * Sorting is performed only if the array is currently marked as unsorted
   */
  sortEvents() {
    if (!this.isSorted) {
      this.events.sort((a, b) => a.time - b.time);
      this.isSorted = true;
    }
  }

  /**
   * Removes and returns the event with the lowest "time" value
   * @returns {Object|undefined} The event with the lowest time, or undefined if the list is empty
   */
  dequeue() {
    this.sortEvents();
    return this.events.shift();
  }

  /**
   * Returns the event with the lowest "time" without removing it from the list
   * @returns {Object|undefined} The event with the lowest time, or undefined if the list is empty
   */
  peek() {
    this.sortEvents();
    return this.events[0];
  }

  /**
   * Returns the number of events in the list
   * @returns {number} The count of events
   */
  size() {
    return this.events.length;
  }

  /**
   * Getter that returns the sorted events array
   * @returns {Object[]} The sorted array of events
   */
  get eventsArray() {
    this.sortEvents();
    return this.events;
  }
}

/**
 * Creates and returns a base batch object used for scheduling and execution
 *
 * @returns {Object} The base batch object.
 */
export function createBaseBatch() {
  return {
    schedulingEndTime: 0,
    executionStartTime: 0,
    executionEndTime: 0,
    executionTimeFrame: 0,
    events: new SortedEventList()
  };
}

/**
 * Normalizes a batch by shifting all event times and batch time properties
 * so that the first event starts at time 0
 *
 * @param {Object} batch - The batch object containing time properties and a SortedEventList of events.
 * @returns {Object} The normalized batch object.
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
  
  // Deduct the shift from every event's time
  batch.events.events.forEach(event => {
    event.time -= shift;
  });
  
  // Deduct the shift from the batch's time properties
  batch.schedulingEndTime -= shift;
  batch.executionStartTime -= shift;
  batch.executionEndTime -= shift;
  
  // Calculate the new execution timeframe
  batch.executionTimeFrame = batch.executionEndTime - batch.executionStartTime;
  
  return batch;
}
