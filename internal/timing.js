/*
   Brian van den Berg
   File: timing.js
   Description: This file contains timing-oriented functions such as scheduling or sleeping.
*/

/**
 * Makes the task inactive for a specified duration.
 *
 * @param {number} ms - The duration in milliseconds for which the task should be inactive.
 * @returns {Promise<void>} A promise that resolves after the specified duration.
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Schedules a task to run periodically with a specified interval.
 *
 * @param {Function} task - The task to be scheduled.
 * @param {Array<any>} args - An array of arguments to be passed to the task function.
 * @param {number} interval - The interval in milliseconds between each execution of the task.
 * @returns {number} The ID of the interval, which can be used to clearInterval.
 */
export function startPeriodicTask(task, args, interval) {
    return setInterval(async () => {
        const result = task(...args);

        if (result instanceof Promise) {
            await result; // Wait for the promise to resolve
        }
    }, interval);
}

/**
 * Stops a periodically running task.
 *
 * @param {number} intervalID - The ID of the interval to be cleared.
 * @returns {void}
 */
export function stopPeriodicTask(intervalID) {
    clearInterval(intervalID);
}
