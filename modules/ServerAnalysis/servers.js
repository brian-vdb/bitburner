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
  const server = ns.getServer(hostname);
  const host = server;
  let maxRam = host.maxRam;

  // If the host is the one running the script, subtract 8GB from the max RAM.
  if (hostname === ns.getHostname()) {
    maxRam = Math.max(maxRam - 64.0, 0.0);
  }

  host.maxThreadsAvailable = Math.floor(maxRam / 1.75);

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
  target.value = target.moneyMax

  // Save the server status to the target
  if (target.securityCurrent !== target.securityMin || target.moneyCurrent !== target.moneyMax) {
    target.status = "heal";
  } else {
    target.status = "hack";
  }

  return target;
}

/**
 * Normalizes the value of each target based on maxMoney and maxTime.
 *
 * @param {Object[]} targets - The array of target objects.
 * @param {number} maxMoneyMultiplier - The maximum multiplier assigned for money.
 * @param {number} maxTimeMultiplier - The maximum multiplier assigned for time.
 * @returns {Object[]} The same targets array with an updated 'value' property.
 */
export function normalizeTargets(targets, maxMoneyMultiplier, maxTimeMultiplier) {
  if (targets.length === 0) return targets;
  
  // Determine global min and max values for money and time
  const minMoney = Math.min(...targets.map(target => target.moneyMax));
  const maxMoney = Math.max(...targets.map(target => target.moneyMax));
  const minTime = Math.min(...targets.map(target => target.maxTime));
  const maxTime = Math.max(...targets.map(target => target.maxTime));
  
  // Detirmine the ranges
  const moneyRange = maxMoney - minMoney;
  const timeRange = maxTime - minTime;
  
  targets.forEach(target => {
    // Normalize money
    let normalizedMoney = moneyRange === 0
      ? 1
      : 1 + ((target.moneyMax - minMoney) / moneyRange) * (maxMoneyMultiplier - 1);
    
    // Compute time multiplier
    let timeMultiplier = timeRange === 0
      ? 1
      : 1 + ((maxTimeMultiplier - 1) * ((maxTime - target.maxTime) / timeRange));
    
    // Final normalized value
    target.value = normalizedMoney * timeMultiplier;
  });
  
  return targets;
}
