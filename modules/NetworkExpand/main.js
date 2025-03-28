/*
  Brian van den Berg
  Module: NetworkExpand
  File: main.js
  Description: Tool to expand the network of in-home servers
*/

/**
 * Generates a list of purchasable server hostnames in the format "home-{i}"
 * Loops from 1 up to and including the maximum number of servers that can be purchased
 *
 * @param {import("../../index").NS} ns - The environment object
 * @returns {string[]} Array of hostnames for purchasable servers
 */
function getPurchasedServerHostnames(ns) {
  const limit = ns.getPurchasedServerLimit();
  const hostnames = [];
  for (let i = 1; i <= limit; i++) {
    hostnames.push(`home-${i}`);
  }
  return hostnames;
}

/**
 * Handles the case where a server does not exist by attempting to purchase it
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {string} hostname - The hostname to purchase
 * @param {number} availableMoney - Money available from the home server
 * @param {number} maxPower - The maximum power (exponent) based on the maximum purchasable RAM
 */
function handleNonExistingServer(ns, hostname, availableMoney, maxPower) {
  let chosenRam = 0;

  // Determine the highest affordable RAM (as a power of 2)
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
 * Handles the case where a server already exists by attempting to upgrade it
 *
 * @param {import("../../index").NS} ns - The environment object
 * @param {string} hostname - The hostname of the existing server
 * @param {number} availableMoney - Money available from the home server
 * @param {number} maxPower - The maximum power (exponent) based on the maximum purchasable RAM
 */
function handleExistingServer(ns, hostname, availableMoney, maxPower) {
  const currentRam = ns.getServerMaxRam(hostname);
  let targetRam = currentRam;

  // Look for an affordable upgrade from the next power of 2 up to the maximum RAM
  for (let power = Math.log2(currentRam) + 1; power <= maxPower; power++) {
    const newRam = 2 ** power;
    const upgradeCost = ns.getPurchasedServerUpgradeCost(hostname, newRam);
    if (upgradeCost <= availableMoney) {
      targetRam = newRam;
    } else {
      break;
    }
  }

  // Upgrade the server RAM
  if (targetRam > currentRam) {
    if (ns.upgradePurchasedServer(hostname, targetRam)) {
      ns.tprint(`Upgraded server ${hostname} from ${ns.formatRam(currentRam)} to ${ns.formatRam(targetRam)}.`);
    }
  }
}

/**
 * Main function to expand the network of in-home servers
 *
 * @param {import("../../index").NS} ns - The environment object
 * @returns {Promise<void>} Resolves when the operation is complete
 */
export async function main(ns) {
  // Fetch the possible hostnames to use
  const hostnames = getPurchasedServerHostnames(ns);

  // Get the maximum RAM
  const maxRam = ns.getPurchasedServerMaxRam();
  const maxPower = Math.log2(maxRam);

  // Loop through each hostname and handle accordingly
  for (const hostname of hostnames) {
    const availableMoney = ns.getServerMoneyAvailable("home");
    if (!ns.serverExists(hostname)) {
      handleNonExistingServer(ns, hostname, availableMoney, maxPower);
    } else {
      handleExistingServer(ns, hostname, availableMoney, maxPower);
    }
  }
}
