/*
   Brian van den Berg
   Module: PropagationAttack
   File: main.js
   Description: This module contains functions related to network propagation and intrusion for the PropagationAttack feature.
*/

import { getAvailableHacks, intrudeServer } from "./PropagationAttack/intrude";
import { saveArrayAsJSON } from "./internal/json";

/**
 * Propagates through the network and all of its nodes.
 *
 * @param {import("../index").NS} ns - The environment.
 * @param {string} host - The hostname of the server currently being propagated from
 * @param {string[]} hostnames - The list of hostnames that have been seen
 * @returns {string[]} An array of server hostnames on the network.
 */
function _propagateNetwork(ns, host, hostnames) {
    hostnames.push(host);

    // Find the neighboring servers
    const targets = ns.scan(host);

    // Using forEach to iterate over the array
    targets.forEach((target) => {
        if (!hostnames.includes(target)) {
            hostnames = _propagateNetwork(ns, target, hostnames);
        }
    });

    return hostnames;
}

/** @param {import("../index").NS} ns */
export async function main(ns) {
    const host = ns.getHostname();
    let hostnames = [];
    
    // Get a list of all of the hostnames in the whole network
    hostnames = _propagateNetwork(ns, host, hostnames);

    // Save the list of hostnames for future reference
    saveArrayAsJSON(ns, hostnames, 'servers.txt');

    // Get the list of available hacking methods
    const hacks = getAvailableHacks(ns);

    // Hack into every vulnerable server in the network
    hostnames.forEach((hostname) => {
        intrudeServer(ns, hacks, hostname);
    });
}
