/*
  Brian van den Berg
  Module: ServerAnalysis
  File: main.js
  Description: Tool to perform server analysis.
*/

import { readJSONFile, writeJSONFile } from "internal/json";
import { prepareHost, prepareTarget } from "./servers";
import { normalizeTargets } from "./servers";

/**
 * Perform a server analysis.
 * Start a server analysis using data/servers.txt to split it into hosts and targets
 * The results get stored in hosts.txt and targets.txt
 *
 * Optional args:
 *   ns.args[1] - max action time (default: 1440)
 * 
 * @param {import("../../index").NS} ns - The environment object
 * @returns {Promise<void>} Resolves when the analysis is complete
 */
export async function main(ns) {
  if (ns.args.length < 1) {
    throw new Error(`Expected program parameters: [serversFile: string, maxHackTargets?: number]`);
  }

  // Setup data containers
  const servers = readJSONFile(ns, ns.args[0]);
  const hosts = [];
  const targets = [];

  // Extract optional parameters with default values if not provided
  let maxActionTime = ns.args[1] !== undefined ? ns.args[1] : 1440;
  maxActionTime = maxActionTime * 60 * 1000;

  // Loop through every known server to find valid hosts, limit to first 25 servers
  for (const server of servers) {
    if (hosts.length >= ns.getPurchasedServerLimit()) break;

    // Check if the server is a valid host
    if (ns.hasRootAccess(server.hostname) && server.hostname !== 'home') {
      hosts.push(prepareHost(ns, server.hostname));
    }
  }

  // Store the result
  writeJSONFile(ns, hosts, "data/hosts.txt");

  // Loop through every known server to find valid targets
  servers.forEach((server) => {
    // Get hacking level and requirement
    const level = ns.getHackingLevel();
    const required = ns.getServerRequiredHackingLevel(server.hostname);

    // Check if the server is a valid hacking target
    if (
      level >= required &&
      ns.getServerMaxMoney(server.hostname) > 0 &&
      ns.hasRootAccess(server.hostname) &&
      !server.hostname.startsWith('home')
    ) {
      const target = prepareTarget(ns, server.hostname);
      if (maxActionTime === undefined || target.maxTime < maxActionTime) targets.push(target);
    }
  });

  // Normalize the target values
  const normalizedTargets = normalizeTargets(targets, 2, 1.5);

  // Store the result
  writeJSONFile(ns, normalizedTargets, "data/targets.txt");
}
