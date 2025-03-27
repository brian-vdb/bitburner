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
 * Normalizes batches to move the start and end times according to the lowest start time.
 *
 * @param {Object[]} batches - The collection of batch objects.
 * @returns {Object[]} The collection of normalized batch objects.
 */
export function normalizeBatches(batches) {
  if (!batches.length) return batches;
  
  // Find the lowest schedulingStartTime among all batches
  const minStartTime = Math.min(...batches.map(batch => batch.schedulingStartTime));
  
  // Return a new array with adjusted times
  return batches.map(batch => {
    return {
      ...batch,
      schedulingStartTime: batch.schedulingStartTime - minStartTime,
      schedulingEndTime: batch.schedulingEndTime - minStartTime
    };
  });
}
