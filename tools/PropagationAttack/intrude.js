/*
  Brian van den Berg
  Module: PropagationAttack
  File: intrude.js
  Description: Functions related to server intrusion.
*/

import { uploadPublicScriptsToServer } from "tools/PropagationAttack/upload";

/**
 * Get available hacks as an array of functions.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {((hostname: string) => void)[]} An array of functions that take a 'hostname' argument and return void.
 */
export function getAvailableHacks(ns) {
  const hacks = [];

  if (ns.fileExists("BruteSSH.exe")) hacks.push(ns.brutessh);
  if (ns.fileExists("FTPCrack.exe")) hacks.push(ns.ftpcrack);
  if (ns.fileExists("relaySMTP.exe")) hacks.push(ns.relaysmtp);
  if (ns.fileExists("HTTPWorm.exe")) hacks.push(ns.httpworm);
  if (ns.fileExists("SQLInject.exe")) hacks.push(ns.sqlinject);

  return hacks;
}

/**
 * Attempt to intrude into previously found nodes.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string} hostname - Hostname of the attacking server.
 * @param {string} target - The server to try and intrude.
 * @param {((hostname: string) => void)[]} hacks - Port hacks to compromise a server.
 * @returns {void}
 */
export function intrudeServer(ns, hostname, target, hacks) {
  // Check if the server is already compromised
  if (ns.hasRootAccess(target)) {
    // Update the public scripts
    if (!uploadPublicScriptsToServer(ns, hostname, target)) {
      ns.tprint(`Warning: Failed to update 'public/*' on ${target}`);
    }
    return;
  }

  // Check if we can compromise the server
  const hacksRequired = ns.getServerNumPortsRequired(target);
  if (hacks.length < hacksRequired) return;

  // Perform the required amount of hacks
  for (let i = 0; i < hacksRequired; i++) {
    hacks[i](target);
  }

  // Compromise the server
  ns.nuke(target);

  // Upload the public scripts
  if (!uploadPublicScriptsToServer(ns, hostname, target)) {
    ns.tprint(`Warning: Failed to upload 'public/*' to ${target}`);
  }

  // Log the successful compromise
  const date = new Date();
  ns.tprint(`${date.getHours()}.${date.getMinutes()}: ${target} Compromised`);
}
