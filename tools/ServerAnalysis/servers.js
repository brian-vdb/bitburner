/*
  Brian van den Berg
  Module: ServerAnalysis
  File: servers.js
  Description: Functions related to server information.
*/

/**
 * Prepare a host object with information about the specified server.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} hostname - The hostname of the server.
 * @returns {Object} The host object containing information about the server.
 */
export function prepareHost(ns, hostname) {
  const host = { hostname: hostname };

  // Get server RAM
  host.ramMax = ns.getServerMaxRam(host.hostname);
  host.ramAvailable = host.ramMax - ns.getServerUsedRam(host.hostname)
  host.threadsAvailable = Math.floor(host.ramAvailable / 0.15)

  return host;
}

/**
 * Prepare a target object with information about the specified server.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} hostname - The hostname of the server.
 * @returns {Object} The target object containing information about the server.
 */
export function prepareTarget(ns, hostname) {
  const target = { hostname: hostname };

  // Get Security statistics
  target.securityMin = ns.getServerMinSecurityLevel(target.hostname);
  target.securityCurrent = ns.getServerSecurityLevel(target.hostname);

  // Get Money statistics
  target.moneyCurrent = ns.getServerMoneyAvailable(target.hostname);
  target.moneyMax = ns.getServerMaxMoney(target.hostname);
  
  // Save the hack timing information
  target.weakenTime = ns.getWeakenTime(target.hostname)
  target.growTime = ns.getGrowTime(target.hostname)
  target.hackTime = ns.getHackTime(target.hostname)

  // Calculate the minimum and maximum time requirement for the target
  target.minTime = Math.min(target.weakenTime, target.growTime, target.hackTime);
  target.maxTime = Math.max(target.weakenTime, target.growTime, target.hackTime);

  // Assign a value to the target
  target.value = (target.moneyMax / 100)

  // Save the server status to the target
  if (target.securityCurrent !== target.securityMin) {
    target.status = "weaken";
  } else if (target.moneyCurrent !== target.moneyMax) {
    target.status = "grow";
  } else {
    target.status = "hack";
  }

  return target;
}

/**
 * Sorts the targets array based on the target status (hack -> grow -> weaken)
 * and limits the hack targets to the top `maxHackTargets` based on their value.
 *
 * @param {Object[]} targets - Array of target objects populated with prepareTarget.
 * @param {number} maxHackTargets - Maximum number of hack targets to include.
 * @returns {Object[]} Sorted and filtered targets array.
 */
export function sortAndLimitTargets(targets, maxHackTargets) {
  // Separate targets by their status
  const hackTargets = targets.filter(target => target.status === "hack");
  const growTargets = targets.filter(target => target.status === "grow");
  const weakenTargets = targets.filter(target => target.status === "weaken");

  // Sort hack targets in descending order by value and limit to maxHackTargets
  const limitedHackTargets = hackTargets.sort((a, b) => b.value - a.value).slice(0, maxHackTargets);

  // Optionally sort grow and weaken targets by value descending (for consistency)
  const sortedGrowTargets = growTargets.sort((a, b) => b.value - a.value);
  const sortedWeakenTargets = weakenTargets.sort((a, b) => b.value - a.value);

  // Combine arrays: hack targets first, then grow targets, then weaken targets
  return [...limitedHackTargets, ...sortedGrowTargets, ...sortedWeakenTargets];
}
