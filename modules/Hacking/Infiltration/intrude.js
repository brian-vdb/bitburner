/*
  Brian van den Berg
  Module: HackingInfiltration
  File: intrude.js
  Description: Functions related to server intrusion.
*/

import { uploadPublicScriptsToServer } from "./upload";

/**
 * Recursively scans the network and collects all connected servers.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {string} hostname - The current server hostname.
 * @param {string[]} servers - Accumulator for discovered servers.
 * @returns {string[]} Array of all discovered server hostnames.
 */
export function propagateNetwork(ns, hostname, servers) {
  servers.push(hostname);

  const neighbors = ns.scan(hostname);
  neighbors.forEach((target) => {
    if (!servers.includes(target)) {
      propagateNetwork(ns, target, servers);
    }
  });

  return servers;
}

/**
 * Gets all currently available port hacking programs.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @returns {((hostname: string) => void)[]} Array of hacking functions.
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
 * Attempts to compromise a server using available exploits and uploads scripts.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {string} hostname - The host initiating the intrusion.
 * @param {string} target - The target server.
 * @param {((hostname: string) => void)[]} hacks - Array of hacking functions.
 */
export function intrudeServer(ns, hostname, target, hacks) {
  if (ns.hasRootAccess(target)) {
    if (!uploadPublicScriptsToServer(ns, hostname, target)) {
      ns.tprint(`Warning: Failed to update 'public/*' on ${target}`);
    }
    return;
  }

  const hacksRequired = ns.getServerNumPortsRequired(target);
  if (hacks.length < hacksRequired) return;

  for (let i = 0; i < hacksRequired; i++) {
    hacks[i](target);
  }

  ns.nuke(target);

  if (!uploadPublicScriptsToServer(ns, hostname, target)) {
    ns.tprint(`Warning: Failed to upload 'public/*' to ${target}`);
  }

  const date = new Date();
  ns.tprint(`${date.getHours()}.${date.getMinutes()}: ${target} Compromised`);
}
