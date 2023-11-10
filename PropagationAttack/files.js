/*
   Brian van den Berg
   File: files.js
   Description: This file contains functions related to saving the hostnames of servers.
*/

/**
 * Saves an array of data as a JSON format in a .txt file
 *
 * @param {import("../index").NS} ns - The environment.
 * @param {Array} data - An array of data to be saved as JSON.
 * @param {string} filename - The name of the file to be written.
 * @returns {void}
 */
export function saveArrayAsJSON(ns, data, filename) {
    if (!data || data.length === 0) {
        ns.tprint("No data provided to store.");
        return;
    }

    const jsonContent = data.map(item => JSON.stringify({ item }, null, 2)).join('\n');
    ns.write(filename || "data.txt", jsonContent, "w");
    ns.tprint(`Data stored in '${filename || "data.txt"}'`);
}