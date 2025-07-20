import { awaitScript } from "internal/process";

/**
 * Launches the network expansion script to purchase or identify more servers.
 *
 * @param {import("../index").NS} ns - The Bitburner environment object.
 * @returns {Promise<void>} Resolves when the script completes.
 * @throws {Error} If the script fails to start.
 */
export async function networkExpand(ns) {
  const pid = ns.exec(
    "modules/Network/Expand/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    }
  );

  if (pid === 0) throw new Error("Failed to start networkExpand");

  await awaitScript(ns, pid);
}

/**
 * Launches the network synchronization script to update server data or configurations.
 *
 * @param {import("../index").NS} ns - The Bitburner environment object.
 * @returns {Promise<void>} Resolves when the script completes.
 * @throws {Error} If the script fails to start.
 */
export async function networkSync(ns) {
  const pid = ns.exec(
    "modules/Network/Sync/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    }
  );

  if (pid === 0) throw new Error("Failed to start networkSync");

  await awaitScript(ns, pid);
}

/**
 * Launches the hacking infiltration script to perform initial hacks or weaken targets.
 *
 * @param {import("../index").NS} ns - The Bitburner environment object.
 * @returns {Promise<void>} Resolves when the script completes.
 * @throws {Error} If the script fails to start.
 */
export async function hackingInfiltration(ns) {
  const pid = ns.exec(
    "modules/Hacking/Infiltration/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    }
  );

  if (pid === 0) throw new Error("Failed to start hackingInfiltration");

  await awaitScript(ns, pid);
}

/**
 * Launches the hacking analysis script to evaluate potential targets and calculate thread costs.
 *
 * @param {import("../index").NS} ns - The Bitburner environment object.
 * @param {number} [maxActionTime=1440] - Optional max action time to filter long jobs.
 * @returns {Promise<void>} Resolves when the script completes.
 * @throws {Error} If the script fails to start.
 */
export async function hackingAnalysis(ns, maxActionTime = 1440) {
  const pid = ns.exec(
    "modules/Hacking/Analysis/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    },
    "data/servers.txt",
    maxActionTime
  );

  if (pid === 0) throw new Error("Failed to start hackingAnalysis");

  await awaitScript(ns, pid);
}

/**
 * Executes a heal-based batch extraction strategy (grow + weaken) on available targets.
 *
 * @param {import("../index").NS} ns - The Bitburner environment object.
 * @param {number} [hackInterval=1000] - Interval between script events in a batch.
 * @returns {Promise<void>} Resolves when the script completes.
 * @throws {Error} If the script fails to start.
 */
export async function extractionOrchestratedHeal(ns, hackInterval = 1000) {
  const pid = ns.exec(
    "modules/Extraction/Orchestrated/Heal/main.js",
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

  if (pid === 0) throw new Error("Failed to start extractionOrchestratedHeal");

  await awaitScript(ns, pid);
}

/**
 * Launches the ExtractionOrchestratedPrepare script to calculate execution windows for batches.
 *
 * @param {import("../index").NS} ns - The Bitburner environment object.
 * @returns {Promise<void>} Resolves when the script completes.
 * @throws {Error} If the script fails to start.
 */
export async function extractionOrchestratedPrepare(ns) {
  const pid = ns.exec(
    "modules/Extraction/Orchestrated/Prepare/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
      temporary: false,
      threads: 1,
    },
    "data/batches.txt"
  );

  if (pid === 0) throw new Error("Failed to start extractionOrchestratedPrepare");

  await awaitScript(ns, pid);
}

/**
 * Executes orchestrated batch hacking using pre-generated batch data.
 *
 * @param {import("../index").NS} ns - The Bitburner environment object.
 * @param {number} [hackInterval=1000] - Interval between thread executions in a batch.
 * @returns {Promise<void>} Resolves when the script completes.
 * @throws {Error} If the script fails to start.
 */
export async function extractionOrchestratedExecution(ns, hackInterval = 1000) {
  const pid = ns.exec(
    "modules/Extraction/Orchestrated/Execution/main.js",
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

  if (pid === 0) throw new Error("Failed to start extractionOrchestratedExecution");

  await awaitScript(ns, pid);
}
