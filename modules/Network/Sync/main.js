/*
  Brian van den Berg
  Module: NetworkSync
  File: main.js
  Description: Tool to sync the network of in-home servers by clearing each target and copying allowed files from the current host.
*/

import { clearTargetServer, copyAllFilesToTarget } from "./sync";

/**
 * Main function to sync the network of in-home servers.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
export async function main(ns) {
  const servers = ns.getPurchasedServers();

  for (const server of servers) {
    clearTargetServer(ns, server);
    if (!copyAllFilesToTarget(ns, server)) {
      ns.tprint(`Failed to copy files from 'home' to ${server}.`);
    }
  }
}
