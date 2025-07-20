/**
 * Checks if a process with the specified PID is currently running.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {number} pid - The process ID to check.
 * @returns {boolean} True if the process is running, false otherwise.
 */
function isProcessRunning(ns, pid) {
  const processes = ns.ps();
  for (let i = 0; i < processes.length; i++) {
    if (processes[i].pid === pid) {
      return true;
    } else if (processes[i].pid > pid) {
      return false;
    }
  }
  return false;
}

/**
 * Waits for a script to finish execution.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {number} pid - The script pid to wait for.
 */
export async function awaitScript(ns, pid) {
  while (isProcessRunning(ns, pid)) {
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}
