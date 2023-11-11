/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related automation.
*/

import { sleep } from './internal/time';

/**
 * Checks if a process with the specified PID is currently running.
 *
 * @param {import("./index").NS} ns - The environment object.
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
 * Weakens a server from a host with a number of threads.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @param {string} hostname - Server hosting the attack.
 * @param {string} target - Server to attack.
 * @param {number} threads - Number of threads to attack with.
 * @returns {boolean} - True if the process started.
 */
function weaken(ns, hostname, target, threads) {
    return ns.exec('public/weaken.js', hostname, {preventDuplicates: false, threads: threads}, target, threads) > 0;
}

/**
 * Grows a server from a host with a number of threads.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @param {string} hostname - Server hosting the attack.
 * @param {string} target - Server to attack.
 * @param {number} threads - Number of threads to attack with.
 * @returns {boolean} - True if the process started.
 */
function grow(ns, hostname, target, threads) {
    return ns.exec('public/grow.js', hostname, {preventDuplicates: false, threads: threads}, target, threads) > 0;
}

/**
 * Hacks a server from a host with a number of threads.
 *
 * @param {import("./index").NS} ns - The environment object.
 * @param {string} hostname - Server hosting the attack.
 * @param {string} target - Server to attack.
 * @param {number} threads - Number of threads to attack with.
 * @returns {boolean} - True if the process started.
 */
function hack(ns, hostname, target, threads) {
    return ns.exec('public/hack.js', hostname, {preventDuplicates: false, threads: threads}, target, threads) > 0;
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
