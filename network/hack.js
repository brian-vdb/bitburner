/*
  Brian van den Berg
  File: hack.js
  Description: Functions to hack a server.
*/

/**
 * Weakens a server from a host with a number of threads.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} hostname - Server hosting the attack.
 * @param {string} target - Server to attack.
 * @param {number} threads - Number of threads to attack with.
 * @returns {boolean} True if the process started.
 */
export function weaken(ns, hostname, target, threads) {
  return (
    ns.exec(
      "public/weaken.js",
      hostname,
      { preventDuplicates: false, threads: threads },
      target,
      threads
    ) > 0
  );
}

/**
 * Grows a server from a host with a number of threads.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} hostname - Server hosting the attack.
 * @param {string} target - Server to attack.
 * @param {number} threads - Number of threads to attack with.
 * @returns {boolean} True if the process started.
 */
export function grow(ns, hostname, target, threads) {
  return (
    ns.exec(
      "public/grow.js",
      hostname,
      { preventDuplicates: false, threads: threads },
      target,
      threads
    ) > 0
  );
}

/**
 * Hacks a server from a host with a number of threads.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} hostname - Server hosting the attack.
 * @param {string} target - Server to attack.
 * @param {number} threads - Number of threads to attack with.
 * @returns {boolean} True if the process started.
 */
export function hack(ns, hostname, target, threads) {
  return (
    ns.exec(
      "public/hack.js",
      hostname,
      { preventDuplicates: false, threads: threads },
      target,
      threads
    ) > 0
  );
}
