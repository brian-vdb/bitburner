/*
  Brian van den Berg
  File: time.js
  Description: Helper functions for working with timing in the game environment.
*/

/**
 * Makes the task inactive for a specified duration.
 *
 * @param {number} ms - The duration in milliseconds for which the task should be inactive.
 * @returns {Promise<void>} A promise that resolves after the specified duration.
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Actively waits until the specified absolute timestamp.
 *
 * This version yields control every iteration using ns.sleep(0) to prevent blocking the game,
 * and returns the current time when the target timestamp is reached.
 *
 * @param {import("../../index").NS} ns - The Bitburner environment object.
 * @param {number} targetTimestamp - The absolute time (in ms) to wait until.
 * @returns {Promise<number>} A promise that resolves to the current time once the target timestamp is reached.
 */
export async function activeWaitUntil(ns, targetTimestamp) {
  let currentTime = Date.now();
  while (currentTime < targetTimestamp) {
    // Yield control to Bitburner's scheduler without a delay.
    await ns.sleep(0);
    currentTime = Date.now();
  }
  return currentTime;
}