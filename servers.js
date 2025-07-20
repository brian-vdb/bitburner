import {
  networkExpand,
  networkSync,
  hackingInfiltration,
} from "./modules/handles";

/**
 * Main function to automate the process of maintaining servers.
 *
 * Optional args:
 *   ns.args[0] - Max action time (default: 1440)
 *
 * @param {import("./index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the script finishes.
 */
export async function main(ns) {
  ns.tprint(" Server Maintenance:");

  ns.tprint(" > Expanding server network...");
  await networkExpand(ns);

  ns.tprint(" > Syncing in-home servers...");
  await networkSync(ns);

  ns.tprint(" > Infecting the network...");
  await hackingInfiltration(ns);
}
