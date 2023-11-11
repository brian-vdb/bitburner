/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related to processes.
*/

/**
 * Checks if a process with the specified PID is currently running.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @param {number} pid - The process ID to check.
 * @returns {boolean} True if the process is running, false otherwise.
 */
export function isProcessRunning(ns, pid) {
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