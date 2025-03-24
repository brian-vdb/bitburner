/*
  Brian van den Berg
  File: handles.js
  Description: Contains handles to execute tools from the main script.
*/

import { awaitScript } from "internal/process";

/**
 * Execute a Propagation Attack.
 * The results are stored in data/servers.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the attack is complete.
 */
export async function propagationAttack(ns) {
  // Start the attack
  const pid = ns.exec(
    "modules/PropagationAttack/main.js",
    ns.getHostname(), {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    }
  );

  // Check if the process started
  if (pid === 0) throw new Error(`Propagation Attack could not be started`);

  // Wait for the process to finish
  await awaitScript(ns, pid);
}

/**
 * Execute a Server Analysis using data/servers.txt.
 * Optionally accepts maxHackTargets.
 * The results are stored in data/hosts.txt and data/targets.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {number} [maxHackTargets=5] - Optional maximum number of hack targets.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function serverAnalysis(ns, maxHackTargets = 5) {
  // Start the analysis
  const pid = ns.exec(
    "modules/ServerAnalysis/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    },
    "data/servers.txt",
    maxHackTargets
  );

  // Check if the process started
  if (pid === 0) throw new Error(`Server Analysis could not be started`);

  // Wait for the process to finish
  await awaitScript(ns, pid);
}

/**
 * Execute a Batch Analysis using data/hosts.txt and data/targets.txt.
 * Optionally accepts hackInterval.
 * The results are stored in data/targets.txt and data/batch.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {number} [hackInterval=1000] - Optional hack interval in ms.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function BatchAnalysis(ns, hackInterval = 1000) {
  // Start the analysis
  const pid = ns.exec(
    "modules/BatchAnalysis/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    },
    "data/hosts.txt",
    "data/targets.txt",
    hackInterval
  );

  // Check if the process started
  if (pid === 0) throw new Error(`Batch Analysis could not be started`);

  // Wait for the process to finish
  await awaitScript(ns, pid);
}

/**
 * Execute a Batch Analysis using data/hosts.txt and data/batch.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function BatchExecution(ns) {
  // Start the execution
  const pid = ns.exec(
    "modules/BatchExecution/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    },
    "data/hosts.txt",
    "data/batch.txt"
  );

  // Check if the process started
  if (pid === 0) throw new Error(`Batch Execution could not be started`);

  // Wait for the process to finish
  await awaitScript(ns, pid);
}
