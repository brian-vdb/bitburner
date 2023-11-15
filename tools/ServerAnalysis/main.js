/*
  Brian van den Berg
  Module: ServerAnalysis
  File: main.js
  Description: This module contains functions related to collecting information about servers.
*/

import { readJSONFile, writeJSONFile } from "internal/json";
import { prepareHost, prepareTarget } from "tools/ServerAnalysis/servers";

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
    throw new Error(`Error: Expected program parameters [inputFile]`);
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
