/*
   Brian van den Berg
   File: main.js
   Description: This file contains handles to run the tools from the main script.
*/

import { awaitScript } from "./internal/process";

/**
 * Executes a Propagation Attack.
 * The result gets stored in data/servers.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<boolean>} - True if the process started.
 */
export async function propagationAttack(ns) {
  // Start the attack
  const pid = ns.exec("./tools/PropagationAttack/main.js", ns.getHostname(), {
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
 * @returns {Promise<boolean>} - True if the process started.
 */
export async function batchAnalysis(ns, inputFile) {
  // Start the analysis
  const pid = ns.exec(
    "./tools/BatchAnalysis/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    },
    "data/targets.txt"
  );

  // Check if the process started
  if (pid == 0) throw new Error(`Batch Analysis could not be started`);

  // Wait for the process to finish
  await awaitScript(ns, pid);

  return 0;
}
