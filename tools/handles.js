/*
   Brian van den Berg
   File: main.js
   Description: This file contains handles to run the tools from the main script.
*/

import { execute, isProcessRunning } from "./internal/process";
import { sleep } from "./internal/time";

/**
 * Executes a Propagation Attack.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} outputFile - Name of the file to store the output in.
 * @returns {boolean} - True if the process started.
 */
export async function propagationAttack(ns, outputFile) {
  // Start the attack
  const pid = execute(
    ns,
    "./tools/PropagationAttack/main.js",
    ns.getHostname(),
    {
      preventDuplicates: true,
    },
    outputFile
  );

  // Wait for the attack to finish
  while (isProcessRunning(ns, pid)) {
    await sleep(20);
  }
}
