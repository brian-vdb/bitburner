/*
   Brian van den Berg
   File: timing.js
   Description: This file contains timing-oriented functions such as scheduling or sleeping.
*/

/**
 * Schedules a task to run periodically with a specified interval.
 *
 * @param {Function} task - The task to be scheduled.
 * @param {number} interval - The interval in milliseconds between each execution of the task.
 * @returns {number} The ID of the interval, which can be used to clearInterval.
 */
export function schedulePeriodicTask(task, interval) {
    return setInterval(async () => {
        const result = task();

        if (result instanceof Promise) {
            await result; // Wait for the promise to resolve
        }
    }, interval);
}

/**
 * Makes the task inactive for a specified duration.
 *
 * @param {number} ms - The duration in milliseconds for which the task should be inactive.
 * @returns {Promise<void>} A promise that resolves after the specified duration.
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
