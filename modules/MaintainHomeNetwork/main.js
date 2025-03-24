/*
  Brian van den Berg
  Module: MaintainHomeNetwork
  File: main.js
  Description: Tool to maintain the network of in-home servers.
*/

import { getPurchasedServerHostnames, managePurchasedServers } from "./servers";

/**
 * Main function to maintain the network of in-home servers.
 *
 * This function retrieves the list of purchasable server hostnames and manages
 * them by buying or upgrading servers as needed.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
export async function main(ns) {
  const hostnames = getPurchasedServerHostnames(ns);
  await managePurchasedServers(ns, hostnames);
}
