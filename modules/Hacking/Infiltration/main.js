/*
  Brian van den Berg
  Module: HackingInfiltration
  File: main.js
  Description: Tool to perform network propagation and intrusion.
*/

import {
  propagateNetwork,
  getAvailableHacks,
  intrudeServer,
} from "./intrude";
import { arrayToJSON, writeJSONFile } from "../../../internal/json";

/**
 * Main function to perform a hacking infiltration across the network.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the infiltration is complete.
 */
export async function main(ns) {
  const hostname = ns.getHostname();
  let servers = [];

  servers = propagateNetwork(ns, hostname, servers);

  // Sort discovered servers by RAM (desc), then by name
  servers.sort((a, b) => {
    const ramDiff = ns.getServerMaxRam(b) - ns.getServerMaxRam(a);
    if (ramDiff !== 0) return ramDiff;

    const aIsHome = a.startsWith("home");
    const bIsHome = b.startsWith("home");
    if (aIsHome !== bIsHome) return aIsHome ? -1 : 1;

    return a.localeCompare(b);
  });

  const hacks = getAvailableHacks(ns);

  servers.forEach((server) => {
    intrudeServer(ns, hostname, server, hacks);
  });

  const jsonServers = arrayToJSON(servers, "hostname");
  writeJSONFile(ns, jsonServers, "data/servers.txt");
}
