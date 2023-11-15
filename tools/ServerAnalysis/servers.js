/*
   Brian van den Berg
   Module: ServerAnalysis
   File: servers.js
   Description: This module contains functions related to servers.
*/

/**
 * Prepares a host object with information about the specified server.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} hostname - The hostname of the server.
 * @returns {Object} The host object containing information about the server.
 */
export function prepareHost(ns, hostname) {
  const host = { hostname: hostname };

  // Get server RAM
  host.maxRam = ns.getServerMaxRam(host.hostname);

  return host;
}

/**
 * Prepares a target object with information about the specified server.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} hostname - The hostname of the server.
 * @returns {Object} The target object containing information about the server.
 */
export function prepareTarget(ns, hostname) {
  const target = { hostname: hostname };

  // Get Security statistics
  const securityMin = ns.getServerMinSecurityLevel(target.hostname);
  const securityCurrent = ns.getServerSecurityLevel(target.hostname);

  // Get Money statistics
  const moneyCurrent = ns.getServerMoneyAvailable(target.hostname);
  const moneyMax = ns.getServerMaxMoney(target.hostname);

  // save the server status to the target
  if (securityCurrent !== securityMin) {
    target.status = "weaken";
  } else if (moneyCurrent !== moneyMax) {
    target.status = "grow";
  } else {
    target.status = "hack";
  }

  // Save the server statistics to the target
  target.securityMin = securityMin;
  target.securityCurrent = securityCurrent;
  target.moneyCurrent = moneyCurrent;
  target.moneyMax = moneyMax;

  return target;
}
