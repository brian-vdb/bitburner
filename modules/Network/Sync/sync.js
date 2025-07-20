/*
  Brian van den Berg
  Module: NetworkSync
  File: sync.js
  Description: Helper functions for syncing in-home server contents.
*/

/**
 * Checks if a file has an allowed extension for SCP.
 *
 * @param {string} file - The file name.
 * @returns {boolean} True if the file is a script, .lit, or .txt file.
 */
export function isAllowedFile(file) {
  return file.endsWith('.js');
}

/**
 * Clears all files from the target server.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {string} target - The target server hostname.
 */
export function clearTargetServer(ns, target) {
  const files = ns.ls(target);
  for (const file of files) {
    ns.rm(file, target);
  }
}

/**
 * Copies all allowed files from the 'home' server to the target server.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {string} target - The target server hostname.
 * @returns {boolean} True if files were successfully copied.
 */
export function copyAllFilesToTarget(ns, target) {
  const files = ns.ls("home").filter(isAllowedFile);
  if (files.length === 0) {
    return false;
  }
  return ns.scp(files, target, "home");
}
