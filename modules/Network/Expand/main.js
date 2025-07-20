/*
  Brian van den Berg
  Module: NetworkExpand
  File: main.js
  Description: Tool to expand the network of in-home servers
*/

import {
  getPurchasedServerHostnames,
  handleNonExistingServer,
  handleExistingServer,
} from "./servers";

/**
 * Main function to expand the network of in-home servers.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
export async function main(ns) {
  const hostnames = getPurchasedServerHostnames(ns);
  const maxRam = ns.getPurchasedServerMaxRam();
  const maxPower = Math.log2(maxRam);

  for (const hostname of hostnames) {
    const availableMoney = ns.getServerMoneyAvailable("home");

    if (!ns.serverExists(hostname)) {
      handleNonExistingServer(ns, hostname, availableMoney, maxPower);
    } else {
      handleExistingServer(ns, hostname, availableMoney, maxPower);
    }
  }
}
