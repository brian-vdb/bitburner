/*
  Brian van den Berg
  Module: NetworkExpand
  File: main.js
  Description: Tool to expand the network of in-home servers with layered upgrades
*/

/**
 * Generates a list of purchasable server hostnames in the format "home-{i}"
 * Loops from 1 up to and including the maximum number of servers that can be purchased.
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
 * Returns the current minimum RAM among purchased servers, or a base RAM if none exist.
 *
 * @param {import("../../index").NS} ns 
 * @param {string[]} hostnames 
 * @param {number} baseRam - The desired minimum starting RAM (e.g. 128 or 2)
 * @returns {number} The current minimum RAM (in GB)
 */
function getCurrentMinRam(ns, hostnames, baseRam) {
  let currentMin = Infinity;
  for (const hostname of hostnames) {
    if (ns.serverExists(hostname)) {
      const ram = ns.getServerMaxRam(hostname);
      if (ram < currentMin) {
        currentMin = ram;
      }
    }
  }
  return currentMin === Infinity ? baseRam : currentMin;
}

/**
 * Main function to expand the network of in-home servers using layered upgrades.
 *
 * Instead of upgrading only if the entire network can be leveled up,
 * this script attempts to upgrade as many servers as possible.
 * It repeatedly determines the current network minimum and then upgrades (or purchases)
 * eligible servers to the next power of 2, until no more upgrades can be performed.
 *
 * @param {import("../../index").NS} ns - The environment object
 * @returns {Promise<void>} Resolves when the operation is complete
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
    let currentMinRam = getCurrentMinRam(ns, hostnames, baseRam);
    let currentLayer = Math.log2(currentMinRam);
    
    // Calculate the target layer (the next power of 2).
    let targetLayer = currentLayer + 1;
    if (targetLayer > maxPower) {
      ns.tprint("All servers are at maximum capacity.");
      break;
    }
    const targetRam = 2 ** targetLayer;
    
    // Flag to check if at least one upgrade/purchase occurred in this pass.
    let upgradesDone = false;
    
    // Attempt to upgrade or purchase each server individually.
    for (const hostname of hostnames) {
      const availableMoney = ns.getServerMoneyAvailable("home");
      
      if (!ns.serverExists(hostname)) {
        // If the server doesn't exist, try to purchase it at targetRam.
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
        // Only consider upgrading servers that are at the current minimum.
        if (currentRam === currentMinRam && currentRam < targetRam) {
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
    
    // If no upgrades occurred during this pass, stop the loop.
    if (!upgradesDone) {
      break;
    }
  }
}
