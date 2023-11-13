/*
   Brian van den Berg
   Module: PropagationAttack
   File: main.js
   Description: This module contains functions related to network propagation and intrusion for the PropagationAttack feature.
*/

import {
  getAvailableHacks,
  intrudeServer,
} from "./tools/PropagationAttack/intrude";
import { arrayToJSON, writeJSONFile } from "./internal/json";

/**
 * Propagates through the network and all of its nodes.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} hostname - The hostname of the server currently being propagated from
 * @param {string[]} servers - The list of servers that have been found
 * @returns {string[]} An array of server hostnames on the network.
 */
function _propagateNetwork(ns, hostname, servers) {
  servers.push(hostname);

  // Find the neighboring servers
  const targets = ns.scan(hostname);

  // Using forEach to iterate over the array
  targets.forEach((target) => {
    if (!servers.includes(target)) {
      servers = _propagateNetwork(ns, target, servers);
    }
  });

  return servers;
}

/**
 * Main function to perform a propagation attack.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the attack is complete.
 */
export async function main(ns) {
  const hostname = ns.getHostname();
  let servers = [];

  // Get a list of all of the servers in the network
  servers = _propagateNetwork(ns, hostname, servers);

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
