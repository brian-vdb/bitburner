/*
   Brian van den Berg
   File: propagate.js
   Description: This file contains functions related to network propagation and intrusion.
*/

import { getAvailableHacks, intrudeServer } from "./intrude";

/**
 * Propagates through the network and all of its nodes.
 *
 * @param {import("../index").NS} ns - The environment.
 * @param {string} host - The hostname of the server currently being propagated from
 * @param {string[]} servers - The list of servers that have been seen
 * @returns {string[]} An array of server hostnames on the network.
 */
function _propagateNetwork(ns, host, servers) {
    servers.push(host);

    // Find the neighboring servers
    const targets = ns.scan(host);

    // Using forEach to iterate over the array
    targets.forEach((target) => {
        if (!servers.includes(target)) {
            servers = _propagateNetwork(ns, target, servers);
        }
    });

    return servers;
}

/** @param {import("../index").NS} ns */
export async function main(ns) {
    const host = ns.getHostname();
    let servers = [];
    
    // Get a list of all of the servers in the whole network
    servers = _propagateNetwork(ns, host, servers);

    // Get the list of available hacking methods
    const hacks = getAvailableHacks(ns);

    // Hack into every vulnerable server in the network
    servers.forEach((server) => {
        intrudeServer(ns, hacks, server);
    });
}
