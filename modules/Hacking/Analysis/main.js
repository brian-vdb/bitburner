/*
  Brian van den Berg
  Module: HackingAnalysis
  File: main.js
  Description: Tool to perform server analysis for hacking.
*/

import { readJSONFile, writeJSONFile } from "internal/json";
import { prepareHost, prepareTarget, normalizeTargets } from "./servers";

/**
 * Perform a server analysis.
 * Reads `data/servers.txt`, classifies servers into hosts and hacking targets,
 * then writes `data/hosts.txt` and `data/targets.txt` with the results.
 *
 * Optional args:
 *   ns.args[1] - Max allowed action time in minutes (default: 1440)
 *
 * @param {import("../../../index").NS} ns - The Bitburner environment object.
 * @returns {Promise<void>} Resolves when analysis is complete.
 */
export async function main(ns) {
  if (ns.args.length < 1) {
    throw new Error(`Expected program parameters: [serversFile: string, maxActionTimeInMinutes?: number]`);
  }

  const servers = readJSONFile(ns, ns.args[0]);
  const hosts = [];
  const targets = [];

  let maxActionTime = ns.args[1] !== undefined ? ns.args[1] : 1440;
  maxActionTime = maxActionTime * 60 * 1000;

  // Identify valid hosts
  for (const server of servers) {
    if (ns.hasRootAccess(server.hostname)) {
      hosts.push(prepareHost(ns, server.hostname));
    }
  }
  writeJSONFile(ns, hosts, "data/hosts.txt");

  // Identify valid hacking targets
  for (const server of servers) {
    const level = ns.getHackingLevel();
    const required = ns.getServerRequiredHackingLevel(server.hostname);

    if (
      level >= required &&
      ns.getServerMaxMoney(server.hostname) > 0 &&
      ns.hasRootAccess(server.hostname) &&
      !server.hostname.startsWith("home")
    ) {
      const target = prepareTarget(ns, server.hostname);
      if (target.maxTime < maxActionTime) {
        targets.push(target);
      }
    }
  }

  const normalizedTargets = normalizeTargets(targets, 2, 1.5);
  writeJSONFile(ns, normalizedTargets, "data/targets.txt");
}
