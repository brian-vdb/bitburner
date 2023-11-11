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
    }

    // Convert the array to a list of JSON objects.
    const jsonData = data.map(item => JSON.stringify({ [fieldname]: item }, null, null)).join();

    // Write the stringified JSON array to the file.
    ns.write(filename || "data.txt", `[${jsonData}]`, "w");
}

/**
 * Reads a JSON file and returns an array of objects.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} filename - The name of the file to be read.
 * @throws {Error} If the file is empty or does not exist.
 * @throws {Error} If there is an issue reading the file or parsing JSON.
 * @returns {Object[]} - An array of parsed JSON objects.
 */
export function readJSONFile(ns, filename) {
    const fileContent = ns.read(filename);
    if (!fileContent) {
        ns.tprint(`File '${filename}' is empty or does not exist.`);
        return [];
    }

    // Parse the string as a JSON object and return it
    try {
        const jsonArray = JSON.parse(fileContent);
        if (!Array.isArray(jsonArray)) {
            throw new Error('File does not contain a valid JSON array.');
        }

        return jsonArray;
    } catch (error) {
        ns.tprint(`Error reading file '${filename}': ${error.message}`);
        return [];
    }
}
