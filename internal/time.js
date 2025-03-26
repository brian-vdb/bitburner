/*
  Brian van den Berg
  File: time.js
  Description: Helper functions for working with timing in the game environment
*/

/**
 * Actively waits until the specified absolute timestamp
 *
 * This version yields control every iteration using ns.sleep(0) to prevent blocking the game,
 * and returns the current time when the target timestamp is reached
 *
 * @param {import("../index").NS} ns - The Bitburner environment object
 * @param {number} targetTimestamp - The absolute time (in ms) to wait until
 * @returns {Promise<number>} A promise that resolves to the current time once the target timestamp is reached
 */
export async function activeWaitUntil(ns, targetTimestamp) {
  let currentTime = Date.now();
  while (currentTime < targetTimestamp) {
    await ns.sleep(0);
    currentTime = Date.now();
  }
  return currentTime;
}
