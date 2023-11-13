/*
   Brian van den Berg
   File: main.js
   Description: This file contains handles to run the tools from the main script.
*/

import { awaitScript } from "./internal/process";

/**
 * Executes a Propagation Attack and stores it in data/servers.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<boolean>} - True if the process started.
 */
export async function propagationAttack(ns) {
  // Start the attack
  const pid = ns.exec(
    "./tools/PropagationAttack/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    }
  );

  // Check if the process was started
  if (pid == 0) {
    return false;
  } else {
    await awaitScript(ns, pid);
    return true;
  }
}

/**
 * Start a server analysis using data/servers.txt to split it into hosts and targets.
 * The result gets stored in hosts.txt and targets.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<boolean>} - True if the process started.
 */
export async function serverAnalysis(ns) {
  // Start the analysis
  const pid = ns.exec(
    "./tools/ServerAnalysis/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    }
  );

  // Check if the process was started
  if (pid == 0) {
    return false;
  } else {
    await awaitScript(ns, pid);
    return true;
  }
}
