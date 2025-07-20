/*
  Brian van den Berg
  Module: ExtractionOrchestratedPrepare
  File: timing.js
  Description: Batch timing utilities: scheduling window calculation and normalization.
*/

/**
 * Computes scheduling and execution timing windows for each batch.
 *
 * @param {Object} batches - Mapping of hostname -> batch.
 * @param {number} hackInterval - Minimum spacing between actions in ms.
 * @returns {Object[]} Array of metadata: hostname, schedulingStart/EndTime, executionStart/EndTime.
 */
export function computeSchedulingWindows(batches, hackInterval) {
  const metadata = [];

  for (const [hostname, batch] of Object.entries(batches)) {
    const schedulingStartTime = 0;
    const schedulingEndTime = batch.maxTime - hackInterval;
    const executionStartTime = schedulingStartTime + batch.maxTime;
    const executionEndTime = schedulingEndTime + batch.maxTime;

    metadata.push({
      hostname,
      schedulingStartTime,
      schedulingEndTime,
      executionStartTime,
      executionEndTime,
    });
  }

  return metadata;
}

/**
 * Normalizes all batches to share the latest executionStartTime, adjusting thread timings.
 *
 * @param {Object} batches - The original batch map (hostname -> batch).
 * @param {Object[]} metadata - Scheduling data returned by computeSchedulingWindows().
 * @returns {void}
 */
export function normalizeExecutionTimes(batches, metadata) {
  const targetStart = Math.max(...metadata.map(m => m.executionStartTime));

  for (const entry of metadata) {
    const shift = targetStart - entry.executionStartTime;
    const batch = batches[entry.hostname];

    // Attach normalized timing
    Object.assign(batch, {
      schedulingStartTime: entry.schedulingStartTime + shift,
      schedulingEndTime: entry.schedulingEndTime + shift,
      executionStartTime: entry.executionStartTime + shift,
      executionEndTime: entry.executionEndTime + shift,
    });
  }
}
