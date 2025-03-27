/*
  Brian van den Berg
  Module: NetworkSync
  File: main.js
  Description: Tool to sync the network of in-home servers by clearing each target and copying allowed files from the current host.
*/

/**
 * Checks if a file has an allowed extension for SCP.
 *
 * @param {string} file - The file name.
 * @returns {boolean} True if the file is a script, .lit, or .txt file.
 */
function isAllowedFile(file) {
  return file.endsWith('.js');
}

/**
 * Clears all files from the target server
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} target - The target server hostname.
 */
function clearTargetServer(ns, target) {
  // Retrieve all files on the target server.
  const files = ns.ls(target);

  // Remove each file from the target.
  for (const file of files) {
    ns.rm(file, target);
  }
}

/**
 * Copies all allowed files from the current host ('home') to the target server.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} target - The target server hostname.
 * @returns {boolean} Whether the files were successfully transmitted.
 */
function copyAllFilesToTarget(ns, target) {
  // Get all files from the 'home' server.
  const allFiles = ns.ls('home');

  // Filter to allowed files only.
  const files = allFiles.filter(isAllowedFile);
  if (files.length === 0) {
    return false;
  }

  // Attempt to copy the files from 'home' to the target server.
  return ns.scp(files, target, 'home');
}

/**
 * Main function to sync the network of in-home servers.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
export async function main(ns) {
  // Retrieve all purchased servers.
  const servers = ns.getPurchasedServers();
  let allSuccess = true;

  // Process each server: clear it then copy allowed files from home.
  for (const server of servers) {
    clearTargetServer(ns, server);
    if (!copyAllFilesToTarget(ns, server)) {
      allSuccess = false;
    }
  }
}
