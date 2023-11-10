/*
   Brian van den Berg
   File: concurrency.js
   Description: This file contains concurrency-oriented functions to achieve load-balancing.
*/

/**
 * Gets the number of logical processors for optimal offloading to workers.
 *
 * @throws {Error} Throws an error if an unexpected error occurs.
 * @returns {number} The number of logical processors.
 */
export function getNumLogicalProcessors() {
    try {
        // Check if navigator is available and contains hardwareConcurrency
        if (navigator && 'hardwareConcurrency' in navigator) {
            const numLogicalProcessors = navigator.hardwareConcurrency || 1;
            return numLogicalProcessors;
        }

        // Default value if navigator or hardwareConcurrency is not available
        return 1;
    } catch (error) {
        throw new Error('Unexpected error while retrieving the number of logical processors');
    }
}

/**
 * Offloads text data processing to workers.
 *
 * @param {import("../.").NS} ns - The namespace object.
 * @param {Function} func - The processing function (can be synchronous or asynchronous).
 * @param {string} filepath - The path to the text file.
 * @throws {Error} Throws an error if the text file does not exist or is empty.
 * @returns {number} The number of Web Workers created.
 */
export function processFileWithWorkers(ns, func, filepath) {
    // Get the number of logical processors
    const numLogicalProcessors = getNumLogicalProcessors();

    // Create and start Web Workers
    const workers = [];
    for (let i = 0; i < numLogicalProcessors - 1; i++) {
        const worker = new Worker('worker.js');
        workers.push(worker);
    }

    // Future TXT worker processing logic
    return workers.length;
}
