/*
  Brian van den Berg
  Module: HackingInfiltration
  File: upload.js
  Description: Functions related to uploading files to servers.
*/

/**
 * Uploads all scripts in the public directory to the target server.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {string} hostname - Server hosting the scripts.
 * @param {string} target - Target server to upload to.
 * @returns {boolean} True if upload was successful.
 */
export function uploadPublicScriptsToServer(ns, hostname, target) {
  const scripts = ns.ls(hostname, "public/");
  return ns.scp(scripts, target, hostname);
}
