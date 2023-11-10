/*
   Brian van den Berg
   File: concurrency.js
   Description: This file contains concurrency-oriented functions to achieve load-balancing.
*/

import Mutex from './internal/mutex';

const _workers = [];
const _workersMutex = new Mutex();

/**
 * Gets the number of logical processors for optimal offloading to workers.
 * @returns {number} The number of logical processors.
 */
function _getNumLogicalProcessors() {
    try {
        return navigator?.hardwareConcurrency || 1;
    } catch (error) {
        throw new Error('Unexpected error while retrieving the number of logical processors');
    }
}

/**
 * Acquires access to the workers array.
 * @returns {Promise<Array>} A promise that resolves to the workers array.
 */
async function _claimWorkers() {
    await _workersMutex.lock();
    
    // Get the amount of logical processors
    const numLogicalProcessors = _getNumLogicalProcessors();

    // Create workers according to the amount
    for (let i = 0; i < numLogicalProcessors - 1; i++) {
        _workers.push(new Worker('worker.js'));
    }

    return _workers;
}

/**
 * Releases access to the workers array.
 */
function _freeWorkers() {
    _workers.forEach(worker => worker.terminate());
    _workers.length = 0; // Clear the workers array

    _workersMutex.unlock();
}

/**
 * Offloads text data processing to workers.
 * @param {import("../.").NS} ns - The namespace object.
 * @param {Function} func - The processing function (can be synchronous or asynchronous).
 * @param {string} filepath - The path to the text file.
 * @throws {Error} Throws an error if the text file does not exist or is empty.
 * @returns {void}
 */
export async function processFileWithWorkers(ns, func, filepath) {
    // Implement your function logic here

    // Test Section
    const workers = await _claimWorkers();
    let workers_length = workers.length;
    _freeWorkers();
    return workers_length;
}
