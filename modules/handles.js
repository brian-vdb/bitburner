/*
  Brian van den Berg
  File: handles.js
  Description: Contains handles to execute tools from the main script
*/

import { awaitScript } from "internal/process";

/**
 * Executes the Network Expand process
 * This process expands the network of in-home servers
 *
 * @param {import("../index").NS} ns - The environment object
 * @returns {Promise<void>} Resolves when the maintenance is complete
 */
export async function networkExpand(ns) {
  // Start the network expand process
  const pid = ns.exec(
    "modules/NetworkExpand/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    }
  );

  // Check if the process started
  if (pid === 0) throw new Error("Network Expand could not be started");

  // Wait for the process to finish
  await awaitScript(ns, pid);
}

/**
 * Executes the Network Sync process
 * This process syncs the network of in-home servers
 *
 * @param {import("../index").NS} ns - The environment object
 * @returns {Promise<void>} Resolves when the maintenance is complete
 */
export async function networkSync(ns) {
  // Start the network sync process
  const pid = ns.exec(
    "modules/NetworkSync/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    }
  );

  // Check if the process started
  if (pid === 0) throw new Error("Network Sync could not be started");

  // Wait for the process to finish
  await awaitScript(ns, pid);
}

/**
 * Executes a Propagation Attack
 * The results are stored in data/servers.txt
 *
 * @param {import("../index").NS} ns - The environment object
 * @returns {Promise<void>} Resolves when the attack is complete
 */
export async function propagationAttack(ns) {
  // Start the attack
  const pid = ns.exec(
    "modules/PropagationAttack/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    }
  );

  // Check if the process started
  if (pid === 0) throw new Error("Propagation Attack could not be started");

  // Wait for the process to finish
  await awaitScript(ns, pid);
}

/**
 * Executes a Server Analysis using data/servers.txt
 * The results are stored in data/hosts.txt and data/targets.txt
 *
 * @param {import("../index").NS} ns - The environment object
 * @param {number} [maxActionTime=1440] - The maximum time an action is allowed to take
 * @returns {Promise<void>} Resolves when the analysis is complete
 */
export async function serverAnalysis(ns, maxActionTime=1440) {
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
    maxActionTime
  );

  // Check if the process started
  if (pid === 0) throw new Error("Server Analysis could not be started");

  // Wait for the process to finish
  await awaitScript(ns, pid);
}

/**
 * Creates a Heal Batch using data/hosts.txt and data/targets.txt.
 * The results are stored in data/targets.txt and data/batch.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {number} [hackInterval=1000] - The hack interval.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function batchCreateHeal(ns, hackInterval=1000) {
  // Start the analysis.
  const pid = ns.exec(
    "modules/BatchCreateHeal/main.js",
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

  // Check if the process started.
  if (pid === 0) throw new Error("Batch Create Heal could not be started");

  // Wait for the process to finish.
  await awaitScript(ns, pid);
}

/**
 * Creates a Hack Batch using data/hosts.txt and data/targets.txt.
 * The results are stored in data/targets.txt and data/batch.txt.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {number} [hackInterval=1000] - The hack interval.
 * @param {number} [hackPercentage=10] - The hack percentage.
 * @returns {Promise<void>} Resolves when the analysis is complete.
 */
export async function batchCreateHack(ns, hackInterval=1000, hackPercentage=10) {
  // Start the analysis.
  const pid = ns.exec(
    "modules/BatchCreateHack/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    },
    "data/hosts.txt",
    "data/targets.txt",
    hackInterval,
    hackPercentage
  );

  // Check if the process started.
  if (pid === 0) throw new Error("Batch Create Hack could not be started");

  // Wait for the process to finish.
  await awaitScript(ns, pid);
}

/**
 * Executes a Batch Execution using data/hosts.txt and data/batch.txt
 *
 * @param {import("../index").NS} ns - The environment object
 * @param {number} [hackInterval=1000] - The hack interval
 * @returns {Promise<void>} Resolves when the execution is complete
 */
export async function batchExecution(ns, hackInterval=1000) {
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
    "data/batches.txt",
    hackInterval
  );

  // Check if the process started
  if (pid === 0) throw new Error("Batch Execution could not be started");

  // Wait for the process to finish
  await awaitScript(ns, pid);
}
