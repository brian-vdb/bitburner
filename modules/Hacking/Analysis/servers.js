/*
  Brian van den Berg
  Module: HackingAnalysis
  File: servers.js
  Description: Utilities for analyzing servers for hacking.
*/

/**
 * Prepares a host object from a given server.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {string} hostname - Hostname of the server.
 * @returns {Object} A host object with available threads.
 */
export function prepareHost(ns, hostname) {
  const server = ns.getServer(hostname);
  const host = server;
  let maxRam = host.maxRam;

  if (hostname === ns.getHostname()) {
    maxRam = Math.max(maxRam - 16.0, 0.0); // Reserve RAM if it's the local host
  }

  host.maxThreadsAvailable = Math.floor(maxRam / 1.75); // Assume 1.75 GB per thread
  return host;
}

/**
 * Prepares a target object for hacking from a given server.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {string} hostname - Hostname of the server.
 * @returns {Object} A target object with timing, money, and status info.
 */
export function prepareTarget(ns, hostname) {
  const target = { hostname };

  target.securityMin = ns.getServerMinSecurityLevel(hostname);
  target.securityCurrent = ns.getServerSecurityLevel(hostname);
  target.moneyCurrent = ns.getServerMoneyAvailable(hostname);
  target.moneyMax = ns.getServerMaxMoney(hostname);

  target.weakenTime = ns.getWeakenTime(hostname);
  target.growTime = ns.getGrowTime(hostname);
  target.hackTime = ns.getHackTime(hostname);

  target.minTime = Math.min(target.weakenTime, target.growTime, target.hackTime);
  target.maxTime = Math.max(target.weakenTime, target.growTime, target.hackTime);

  target.value = target.moneyMax;

  target.status =
    target.securityCurrent !== target.securityMin || target.moneyCurrent !== target.moneyMax
      ? "heal"
      : "hack";

  return target;
}

/**
 * Normalizes the value of each target using max money and inverse max time.
 *
 * @param {Object[]} targets - Array of target objects.
 * @param {number} maxMoneyMultiplier - Scaling weight for moneyMax.
 * @param {number} maxTimeMultiplier - Scaling weight for maxTime.
 * @returns {Object[]} Targets with updated 'value' fields.
 */
export function normalizeTargets(targets, maxMoneyMultiplier, maxTimeMultiplier) {
  if (targets.length === 0) return targets;

  const minMoney = Math.min(...targets.map(t => t.moneyMax));
  const maxMoney = Math.max(...targets.map(t => t.moneyMax));
  const minTime = Math.min(...targets.map(t => t.maxTime));
  const maxTime = Math.max(...targets.map(t => t.maxTime));

  const moneyRange = maxMoney - minMoney;
  const timeRange = maxTime - minTime;

  targets.forEach(target => {
    const normalizedMoney =
      moneyRange === 0 ? 1 : 1 + ((target.moneyMax - minMoney) / moneyRange) * (maxMoneyMultiplier - 1);

    const timeMultiplier =
      timeRange === 0 ? 1 : 1 + ((maxTimeMultiplier - 1) * (maxTime - target.maxTime) / timeRange);

    target.value = normalizedMoney * timeMultiplier;
  });

  return targets;
}
