/**
 * Actively waits until the specified absolute timestamp.
 *
 * @param {import("../index").NS} ns - The Bitburner environment object.
 * @param {number} targetTimestamp - The absolute time (in ms) to wait until.
 * @returns {Promise<number>} A promise that resolves to the current time once the target timestamp is reached.
 */
export async function activeWaitUntil(ns, targetTimestamp) {
  let currentTime = Date.now();
  while (currentTime < targetTimestamp) {
    await ns.sleep(0);
    currentTime = Date.now();
  }
  return currentTime;
}
