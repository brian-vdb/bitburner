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
 * Reads a JSON file and returns the parsed content.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} filename - The name of the file to be read.
 * @returns {Object[]} - An array of objects parsed from the JSON file.
 * @throws {Error} If there is an issue reading the file or parsing JSON.
 */
export function readJSONFile(ns, filename) {
    // Read the content of the JSON file
    const fileContent = ns.read(filename);
    if (!fileContent) {
        throw new Error(`File not found or empty: ${filename}`);
    }

    try {
        // Parse the JSON content
        return JSON.parse(fileContent);
    } catch (error) {
        throw new Error(`Error parsing JSON in file ${filename}: ${error.message}`);
    }
}

/**
 * Writes an array of objects to a JSON file.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} filename - The name of the file to be written.
 * @param {Object[]} jsonArray - An array of objects to be written to the file.
 */
export function writeJSONFile(ns, filename, jsonArray) {
    // Convert the array of objects to a JSON string
    const jsonString = JSON.stringify(jsonArray, null, 2);

    // Write the JSON string to the file
    ns.write(filename, jsonString, 'w');
}
