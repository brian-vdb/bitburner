/*
  Brian van den Berg
  Module: NetworkExpand
  File: servers.js
  Description: Utilities for purchasing and upgrading servers.
 */

/**
 * Generates a list of purchasable server hostnames in the format "home-{i}".
 *
 * @param {import("../../../index").NS} ns - The environment object.
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
 * Attempts to purchase a server with the highest affordable RAM.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {string} hostname - Hostname to purchase.
 * @param {number} availableMoney - Money available from the home server.
 * @param {number} maxPower - Maximum RAM exponent (based on game limits).
 */
export function handleNonExistingServer(ns, hostname, availableMoney, maxPower) {
  let chosenRam = 0;

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
}

/**
 * Attempts to upgrade a server's RAM to the highest affordable option.
 *
 * @param {import("../../../index").NS} ns - The environment object.
 * @param {string} hostname - Hostname of the existing server.
 * @param {number} availableMoney - Money available from the home server.
 * @param {number} maxPower - Maximum RAM exponent (based on game limits).
 */
export function handleExistingServer(ns, hostname, availableMoney, maxPower) {
  const currentRam = ns.getServerMaxRam(hostname);
  let targetRam = currentRam;

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
