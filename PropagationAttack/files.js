/*
   Brian van den Berg
   File: files.js
   Description: This file contains functions related to saving the hostnames of servers.
*/

/**
 * Saves an array of server hostnames as a JSON format in a .txt file
 *
 * @param {import("../index").NS} ns - The environment.
 * @param {string[]} hostnames - An array of server hostnames.
 * @returns {void}
 */
export function saveHostnamesAsJSON(ns, hostnames) {
    if (!hostnames || hostnames.length === 0) {
        ns.tprint("No hostnames provided to store.");
        return;
    }

    const jsonContent = JSON.stringify(hostnames.map(hostname => ({ hostname })), null, 2);
    ns.write("hostnames.txt", jsonContent, "w");
}
