/*
  Brian van den Berg
  File: batch.js
  Description: Components for batch hacking.
*/

/**
 * Creates and returns a base batch template to work from.
 *
 * @returns {Object} The base batch object.
 */
export function createBatchTemplate() {
  return {
    schedulingStartTime: 0,
    schedulingEndTime: 0,
    amount: 0,
    threads: []
  };
}

/**
 * Normalizes a batch templates by shifting the start and end times according to the earliest start time.
 *
 * @param {Object[]} templates - array of template objects to normalize.
 * @returns {Object[]} The normalized template object.
 */
export function normalizeBatchTemplates(templates) {
  return templates;
}
