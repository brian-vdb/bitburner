/*
   Brian van den Berg
   File: mutex.js
   Description: Mutex class for restricting access to a resource to only one task at a time.
*/

/**
 * Mutex class for controlling access to a critical section.
 */
export default function Mutex() {
    this._locked = false;
    this._queue = []; // Queue to manage asynchronous operations
}

/**
 * Locks the mutex.
 * @returns {Promise<void>} A promise that resolves when the mutex is locked.
 */
Mutex.prototype.lock = function () {
    if (!this._locked) {
        this._locked = true;
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        // Enqueue the resolve function to be called when the mutex is unlocked
        this._queue.push(resolve);
    });
};

/**
 * Unlocks the mutex.
 */
Mutex.prototype.unlock = function () {
    this._locked = false;

    // Resolve the waiting promise if there are enqueued requests
    if (this._queue.length > 0) {
        const nextResolve = this._queue.shift();
        nextResolve();
    }
};
