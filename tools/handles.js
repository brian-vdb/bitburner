/*
  Brian van den Berg
  File: handles.js
  Description: Contains handles to execute tools from the main script.
*/

import { awaitScript } from "internal/process";
import { BatchAnalysis } from "tools/BatchAnalysis/main";

/**
 * Execute a Propagation Attack.
 * The results are stored in data/servers.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the attack is complete.
 */
export async function propagationAttack(ns) {
  // Start the attack
  const pid = ns.exec("tools/PropagationAttack/main.js", ns.getHostname(), {
    preventDuplicates: true,
    temporary: false,
    threads: 1,
  });

  // Check if the process started
  if (pid === 0) throw new Error(`Propagation Attack could not be started`);

  // Wait for the process to finish
  await awaitScript(ns, pid);
}

/**
 * Execute a Server Analysis using data/servers.txt.
 * The results are stored in data/hosts.txt and data/targets.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the analysis is complete.
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
  if (pid === 0) throw new Error(`Server Analysis could not be started`);

  // Wait for the process to finish
  await awaitScript(ns, pid);
}

/**
 * Initiate Batch Analysis using data/targets.txt.
 * The results are stored in data/batches.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {number} hackPercentage - The percentage of funds to hack.
 * @param {number} batchInterval - The interval between batch actions in milliseconds.
 * @returns {Promise<void>} Resolves when the Batch Analysis is complete.
 */
export async function batchAnalysis(ns, hackPercentage, batchInterval) {
  await BatchAnalysis(
    ns,
    "data/batches.txt",
    "data/targets.txt",
    hackPercentage,
    batchInterval
  );
}
