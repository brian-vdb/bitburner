/*
  Brian van den Berg
  Module: NetworkExpand
  File: main.js
  Description: Tool to expand the network of in-home servers.
*/

/**
 * Generates a list of purchasable server hostnames in the format "home-{i}".
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {string[]} Array of hostnames for purchasable servers.
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
 * Returns the current minimum RAM among purchased servers, or a base RAM if none exist.
 *
 * @param {import("../../index").NS} ns 
 * @param {string[]} hostnames 
 * @param {number} baseRam - The desired minimum starting RAM.
 * @returns {number} The current minimum RAM (in GB).
 */
function getCurrentMinRam(ns, hostnames, baseRam) {
  let currentMin = Infinity;
  for (const hostname of hostnames) {
    if (ns.serverExists(hostname)) {
      const ram = ns.getServerMaxRam(hostname);
      if (ram < currentMin) {
        currentMin = ram;
      }
    } else {
      return 1;
    }
  }
  return currentMin === Infinity ? baseRam : currentMin;
}

/**
 * Main function to expand the network of in-home servers using layered upgrades.
 *
 * @param {import("../../index").NS} ns - The environment object.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
export async function main(ns) {
  const hostnames = getPurchasedServerHostnames(ns);
  const maxRam = ns.getPurchasedServerMaxRam();
  const maxPower = Math.log2(maxRam);
  
  // Define the base RAM.
  const baseRam = 2;

  // Continue attempting upgrades until none are possible.
  while (true) {
    // Determine the network's current minimum RAM.
    const currentMinRam = getCurrentMinRam(ns, hostnames, baseRam);
    const targetRam = currentMinRam * 2
    if (Math.log2(targetRam) > maxPower) break;
    let upgradesDone = false;

    // Loop through the available hostnames
    for (const hostname of hostnames) {
      const availableMoney = ns.getServerMoneyAvailable("home");
      if (!ns.serverExists(hostname)) {
        // Purchase the missing server at targetRam (which will be baseRam if starting out).
        const cost = ns.getPurchasedServerCost(targetRam);
        if (cost <= availableMoney) {
          const purchased = ns.purchaseServer(hostname, targetRam);
          if (purchased) {
            ns.tprint(`Purchased server ${hostname} with ${ns.formatRam(targetRam)}.`);
            upgradesDone = true;
          }
        }
      } else {
        const currentRam = ns.getServerMaxRam(hostname);

        // Only upgrade servers that are at the current minimum.
        if (currentRam < targetRam) {
          const upgradeCost = ns.getPurchasedServerUpgradeCost(hostname, targetRam);
          if (upgradeCost <= availableMoney) {
            if (ns.upgradePurchasedServer(hostname, targetRam)) {
              ns.tprint(`Upgraded server ${hostname} from ${ns.formatRam(currentRam)} to ${ns.formatRam(targetRam)}.`);
              upgradesDone = true;
            }
          }
        }
      }
    }

    // If no purchases or upgrades occurred during this pass, exit the loop.
    if (!upgradesDone) {
      break;
    }
  }
}
