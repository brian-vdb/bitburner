/*
  Brian van den Berg
  File: handles.js
  Description: This file contains handles to run the tools from the main script.
*/

import { awaitScript } from "internal/process";
import { readJSONFile, writeJSONFile } from "internal/json";

/**
 * Executes a Propagation Attack.
 * The result gets stored in data/servers.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<boolean>} True if the process started.
 */
export async function propagationAttack(ns) {
  // Start the attack
  const pid = ns.exec("tools/PropagationAttack/main.js", ns.getHostname(), {
    preventDuplicates: true,
    temporary: false,
    threads: 1,
  });

  // Check if the process started
  if (pid == 0) throw new Error(`Propagation Attack could not be started`);
  
  // Wait for the process to finish
  await awaitScript(ns, pid);
  
  return 0;
}

/**
 * Start a Server Analysis using data/servers.txt.
 * The result gets stored in data/hosts.txt and data/targets.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<boolean>} True if the process started.
 */
export async function serverAnalysis(ns) {
  // Start the analysis
  const pid = ns.exec(
    "tools/ServerAnalysis/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    },
    "data/servers.txt"
  );

  // Check if the process started
  if (pid == 0) throw new Error(`Server Analysis could not be started`);

  // Wait for the process to finish
  await awaitScript(ns, pid);

  return 0;
}

/**
 * Start a Batch Analysis using data/targets.txt.
 * The result gets stored in data/batches.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<boolean>} True if the process started.
 */
export async function batchAnalysis(ns) {
  const targets = readJSONFile(ns, "data/targets.txt");
  const batches = [];

  // Create data/batches.txt containing target hostnames
  targets.forEach(target => {
    batches.push({ hostname: target.hostname });
  });
  writeJSONFile(ns, batches, "data/batches.txt");

  ns.tprint(batches);

  // Start the hack analysis
  const pid = ns.exec(
    "tools/BatchAnalysis/hackAnalysis.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    },
    "data/batches.txt"
  );

  // Check if the process started
  if (pid == 0) throw new Error(`Hack Analysis could not be started`);

  // Wait for the process to finish
  await awaitScript(ns, pid);

  return 0;
}
