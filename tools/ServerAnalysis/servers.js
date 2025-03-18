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
  
  // Save the server status to the target
  if (target.securityCurrent !== target.securityMin) {
    target.status = "weaken";
  } else if (target.moneyCurrent !== target.moneyMax) {
    target.status = "grow";
  } else {
    target.status = "hack";
  }

  // Calulate the current server value
  target.value = Math.ceil(target.moneyMax / ns.getHackTime(target.hostname))

  return target;
}
