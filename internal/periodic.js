/*
   Brian van den Berg
   File: periodic.js
   Description: This file contains periodically-oriented functionality.
*/

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
