/*
   Brian van den Berg
   Module: ServerAnalysis
   File: main.js
   Description: This module contains functions related to collecting information about servers.
*/

import { readJSONFile, writeJSONFile } from "./internal/json";

/**
 * Prepares a host object with information about the specified server.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} hostname - The hostname of the server.
 * @returns {Object} The host object containing information about the server.
 */
function prepareHost(ns, hostname) {
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
function prepareTarget(ns, hostname) {
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

/**
 * Main function to perform a server analysis.
 * Start a server analysis using data/servers.txt to split it into hosts and targets.
 * The result gets stored in hosts.txt and targets.txt.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 1) {
    ns.tprint("Error: Expected program parameters [inputFile]");
    return;
  }

  // Setup data containers
  const servers = readJSONFile(ns, ns.args[0]);
  const hosts = [];
  const targets = [];

  // Loop through every known server to find valid hosts
  servers.forEach((server) => {
    // Check if the server is a valid host
    if (ns.hasRootAccess(server.hostname)) {
      hosts.push(prepareHost(ns, server.hostname));
    }
  });


  // Store the result
  writeJSONFile(ns, hosts, "data/hosts.txt");

  // Loop through every known server to find valid targets
  servers.forEach((server) => {
    // Get hacking level and requirement
    const level = ns.getHackingLevel();
    const required = ns.getServerRequiredHackingLevel(server.hostname);

    // Check if the server is a valid hacking target
    if (level >= required) {
      targets.push(prepareTarget(ns, server.hostname));
    }
  });

  // Store the result
  writeJSONFile(ns, targets, "data/targets.txt");
}
