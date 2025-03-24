/*
  Brian van den Berg
  Module: MaintainHomeNetwork
  File: servers.js
  Description: Functions related to the managing of purchasable servers.
*/

/**
 * Generates a list of purchasable server hostnames in the format "home-{i}".
 * Loops from 1 up to and including the maximum number of servers that can be purchased.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {string[]} Array of hostnames for purchasable servers.
 */
export function getPurchasedServerHostnames(ns) {
  const limit = ns.getPurchasedServerLimit();
  const hostnames = [];
  for (let i = 1; i <= limit; i++) {
    hostnames.push(`home-${i}`);
  }
  return hostnames;
}

/**
 * Manages purchased servers by either buying or upgrading them.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @param {string[]} hostnames - Array of hostnames to manage.
 */
export async function managePurchasedServers(ns, hostnames) {
  // Get the maximum purchasable RAM and calculate the maximum power
  const maxRam = ns.getPurchasedServerMaxRam();
  const maxPower = Math.log2(maxRam);

  // Loop through each hostname
  for (const hostname of hostnames) {
    const availableMoney = ns.getServerMoneyAvailable("home");

    // If the server does not exist, attempt to purchase it.
    if (!ns.serverExists(hostname)) {
      let chosenRam = 0;
      // Determine the highest RAM (as a power of 2) affordable with the available money.
      for (let power = 1; power <= maxPower; power++) {
        const ram = 2 ** power;
        const cost = ns.getPurchasedServerCost(ram);
        if (cost <= availableMoney) {
          chosenRam = ram;
        } else {
          break;
        }
      }
      if (chosenRam > 0) {
        const purchased = ns.purchaseServer(hostname, chosenRam);
        if (purchased) {
          ns.tprint(`Purchased server ${purchased} with ${ns.formatRam(chosenRam)}.`);
        }
      }
    } else {
      // Server exists, attempt to upgrade.
      const currentRam = ns.getServerMaxRam(hostname);
      let targetRam = currentRam;
      // Look for an affordable upgrade from the next power of 2 up to the maximum RAM.
      for (let power = Math.log2(currentRam) + 1; power <= maxPower; power++) {
        const newRam = 2 ** power;
        const upgradeCost = ns.getPurchasedServerUpgradeCost(hostname, newRam);
        if (upgradeCost <= availableMoney) {
          targetRam = newRam;
        } else {
          break;
        }
      }
      if (targetRam > currentRam) {
        if (ns.upgradePurchasedServer(hostname, targetRam)) {
          ns.tprint(`Upgraded server ${hostname} from ${ns.formatRam(currentRam)} to ${ns.formatRam(targetRam)}.`);
        }
      }
    }
  }
}
