/*
  Brian van den Berg
  Module: PropagationAttack
  File: main.js
  Description: Tool to perform network propagation and intrusion.
*/

import {
  getAvailableHacks,
  intrudeServer,
} from "./intrude";
import { arrayToJSON, writeJSONFile } from "../../internal/json";

/**
 * Propagate through the network and all of its nodes.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} hostname - The current server's hostname for propagation.
 * @param {string[]} servers - The list of discovered servers.
 * @returns {string[]} An array of server hostnames on the network.
 */
function propagateNetwork(ns, hostname, servers) {
  servers.push(hostname);

  // Find neighboring servers
  const targets = ns.scan(hostname);

  // Iterate over the array using forEach
  targets.forEach((target) => {
    if (!servers.includes(target)) {
      servers = propagateNetwork(ns, target, servers);
    }
  });

  return servers;
}

/**
 * Perform a propagation attack.
 * Executes a Propagation Attack and stores results in data/servers.txt.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the attack is complete.
 */
export async function main(ns) {
  const hostname = ns.getHostname();
  let servers = [];

  // Get a list of all servers in the network
  servers = propagateNetwork(ns, hostname, servers);

  // Sort servers
  servers.sort((a, b) => {
    // Compare by max RAM (descending)
    const ramDiff = ns.getServerMaxRam(b) - ns.getServerMaxRam(a);
    if (ramDiff !== 0) return ramDiff;

    // If RAM is equal, check if one is a home server
    const aIsHome = a.startsWith("home");
    const bIsHome = b.startsWith("home");
    if (aIsHome !== bIsHome) {
      return aIsHome ? -1 : 1;
    }

    // If both are the same type, sort alphabetically (ascending)
    return a.localeCompare(b);
  });
  
  // Get the list of available hacking methods
  const hacks = getAvailableHacks(ns);

  // Hack into every vulnerable server in the network
  servers.forEach((server) => {
    intrudeServer(ns, hostname, server, hacks);
  });

  // Save the list of servers for future reference
  const jsonServers = arrayToJSON(servers, "hostname");
  writeJSONFile(ns, jsonServers, "data/servers.txt");
}
