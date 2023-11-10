/*
   Brian van den Berg
   File: timing.js
   Description: This file contains timing-oriented functions such as scheduling or sleeping.
*/

// scheduleTask schedules a task with a delay for execution
export function scheduleTask(task, delay) {
    setTimeout(async () => {
        const result = task();

        if (result instanceof Promise) {
            await result; // Wait for the promise to resolve
        }
    }, delay);
}

// schedulePeriodicTask schedules a task to run periodically with a specified interval
export function schedulePeriodicTask(task, interval) {
    return setInterval(async () => {
        const result = task();

        if (result instanceof Promise) {
            await result; // Wait for the promise to resolve
        }
    }, interval);
}

// sleep makes the task inactive
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
