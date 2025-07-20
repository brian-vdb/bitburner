/**
 * Reads a JSON file and returns the parsed content.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} filename - The name of the file to be read.
 * @returns {Object[]} An array of objects parsed from the JSON file.
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
    const jsonContent = JSON.parse(fileContent);
    return jsonContent;
  } catch (error) {
    throw new Error(`Error parsing JSON in file ${filename}: ${error.message}`);
  }
}

/**
 * Writes an array of objects to a JSON file.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {Object[]} jsonArray - An array of objects to be written to the file.
 * @param {string} filename - The name of the file to be written.
 */
export function writeJSONFile(ns, jsonArray, filename) {
  // Convert the array of objects to a JSON string
  const jsonString = JSON.stringify(jsonArray, null, 2);

  // Write the JSON string to the file
  ns.write(filename, jsonString, "w");
}

/**
 * Converts an array to JSON objects.
 *
 * @param {any[]} array - Input array to translate into an object array.
 * @param {string} fieldname - Name of the variables inside of the array.
 * @returns {Object[]} An array of objects converted from the input array.
 */
export function arrayToJSON(array, fieldname) {
  return array.map((item) => {
    return { [fieldname]: item };
  });
}
