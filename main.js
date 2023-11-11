/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related automation.
*/

import { sleep } from './internal/time';

/**
 * Checks if a process with the specified PID is currently running.
 *
 * @param {import("./index").NS} ns - The namespace object.
 * @param {number} pid - The process ID to check.
 * @returns {boolean} True if the process is running, false otherwise.
 */
function isProcessRunning(ns, pid) {
    // Getting a list of processes
    const processes = ns.ps();

    // Iterate through the list of processes
    for (let i = 0; i < processes.length; i++) {
        // Find the matching PID
        if (processes[i].pid === pid) {
            return true; // Found the specified process
        } else if (processes[i].pid > pid) {
            return false;
        }
    }

    // Specified process not found in processes
    return false;
}

/**
 * Main function to automate the game.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the script finishes.
 */
export async function main(ns) {
    const hostname = ns.getHostname();

    // Perform the Propagation Attack
    const pid = ns.exec('./PropagationAttack/main.js', hostname, { preventDuplicates: true });
    while (isProcessRunning(ns, pid)) {
        await sleep(20);
    }
}
