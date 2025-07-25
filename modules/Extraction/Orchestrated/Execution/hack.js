/*
  Brian van den Berg
  Module: ExtractionOrchestratedExecution
  File: hack.js
  Description: Script dispatch functions for hacking-related actions.
*/

/**
 * Executes a script against a target server from a host.
 *
 * @param {import("../index").NS} ns - Bitburner environment object.
 * @param {string} script - Path to the script to execute.
 * @param {string} hostname - Server that will run the script.
 * @param {string} target - Target server of the action.
 * @param {number} threads - Number of threads to use.
 * @param {number} additionalMsec - Delay offset in milliseconds.
 * @returns {boolean} True if the script was successfully started.
 */
function runScript(ns, script, hostname, target, threads, additionalMsec) {
  const pid = ns.exec(
    script,
    hostname,
    { preventDuplicates: false, threads },
    target,
    threads,
    additionalMsec
  );

  if (pid === 0) {
    ns.tprint(`[EXEC FAIL] ${script} failed on ${hostname} → ${target} (${threads} threads, ${additionalMsec}ms delay)`);
    return false;
  }

  return true;
}

/**
 * Launch a weaken script.
 */
export function weaken(ns, hostname, target, threads, additionalMsec) {
  return runScript(ns, "public/weaken.js", hostname, target, threads, additionalMsec);
}

/**
 * Launch a grow script.
 */
export function grow(ns, hostname, target, threads, additionalMsec) {
  return runScript(ns, "public/grow.js", hostname, target, threads, additionalMsec);
}

/**
 * Launch a hack script.
 */
export function hack(ns, hostname, target, threads, additionalMsec) {
  return runScript(ns, "public/hack.js", hostname, target, threads, additionalMsec);
}
