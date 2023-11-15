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
