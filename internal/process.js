/*
   Brian van den Berg
   File: main.js
   Description: This file contains functionality related to processes.
*/

/**
 * Start a script on a host.
 * Abstraction layer to allow for middleware.
 * 
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} script - The script to execute.
 * @param {string} hostname - The host to execute the script.
 * @param {import("../index").RunOptions | undefined} opts - Options to configure the thread.
 * @param {string | number | boolean)[]} args - Optional arguements to pass to the script.
 * @returns {number} - pid of the script that started.
 */
export function execute(ns, script, hostname, opts, args) {
  return ns.exec(
    script,
    hostname,
    opts,
    args
  );
}

/**
 * Checks if a process with the specified PID is currently running.
 *
 * @param {import("../index").NS} ns - The environment object.
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
