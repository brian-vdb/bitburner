/**
 * Get linked servers by scanning the network.
 *
 * @param {import("../.").NS} ns - The environment.
 * @param {string} hostname - The hostname to scan.
 * @returns {string[]} An array of linked server hostnames.
 */
export function getLinkedServers(ns, hostname) {
    return ns.scan(hostname);
}
