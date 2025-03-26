/*
  Brian van den Berg
  Module: PropagationAttack
  File: upload.js
  Description: Functions related to uploading files to servers
*/

/**
 * Uploads all scripts in the public folder to a server
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {string} hostname - Hostname of the uploading server
 * @param {string} target - The server to upload to
 * @returns {boolean} Whether the files were successfully transmitted
 */
export function uploadPublicScriptsToServer(ns, hostname, target) {
  const scripts = ns.ls(hostname, "public/");
  return ns.scp(scripts, target, hostname);
}
