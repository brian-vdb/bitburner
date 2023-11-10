/*
   Brian van den Berg
   File: intrude.js
   Description: This file contains functions related to intrusion of servers.
*/

/**
 * Gets the available hacks as an array of functions.
 *
 * @param {import("../index").NS} ns - The environment.
 * @returns {((hostname: string) => void)[]} An array of functions that take a 'hostname' argument and return void.
 */
export function getAvailableHacks(ns) {
    const hacks = [];

    if (ns.fileExists('BruteSSH.exe')) hacks.push(ns.brutessh);
    if (ns.fileExists('FTPCrack.exe')) hacks.push(ns.ftpcrack);
    if (ns.fileExists('relaySMTP.exe')) hacks.push(ns.relaysmtp);
    if (ns.fileExists('HTTPWorm.exe')) hacks.push(ns.httpworm);
    if (ns.fileExists('SQLInject.exe')) hacks.push(ns.sqlinject);

    return hacks;
}

/**
 * Attempts to intrude into the previously found nodes.
 *
 * @param {import("../index").NS} ns - The environment.
 * @param {string} hostname - The server to try and intrude
 * @returns {void}
 */
export function intrudeServer(ns, hacks, hostname) {
    // Check if the server is already nuked
    if (ns.hasRootAccess(hostname)) return;

    // Check if we can nuke the server
    const hacksRequired = ns.getServerNumPortsRequired(hostname);
    if (hacks.length < hacksRequired) return;

    // Perform the required amount of hacks
    for (let i = 0; i < hacksRequired; i++) {
        hacks[i](hostname);
    }

    // Nuke the server
    ns.nuke(hostname);

    // Log the successful nuke
    const date = new Date();
    ns.tprint(`${date.getHours()}.${date.getMinutes()}: ${hostname} Nuked`);
}
