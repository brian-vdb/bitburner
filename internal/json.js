/*
   Brian van den Berg
   File: json.js
   Description: Helper functions for working with JSON data in the game environment.
*/

/**
 * Saves an array of data as a JSON format in a .txt file.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {Array} data - An array of data to be saved as JSON.
 * @param {string} fieldname - Name of the value in the array
 * @param {string} filename - The name of the file to be written.
 * @returns {void}
 */
export function saveArrayAsJSON(ns, data, fieldname, filename) {
    if (!data || data.length === 0) {
        ns.tprint("No data provided to store.");
        return;
    }

    const jsonContent = data.map(item => JSON.stringify({ [fieldname]: item }, null, 2)).join('\n');
    ns.write(filename || "data.txt", jsonContent, "w");
    ns.tprint(`Data stored in '${filename || "data.txt"}' as JSON.`);
}
