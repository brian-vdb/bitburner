import { schedulePeriodicTask, sleep } from './internal/timing';

function HelloWorld(func) {
    func("Hello world!")
}

export async function main(ns) {
    schedulePeriodicTask(HelloWorld, [ns.tprint], 1000);
    while(true) {
        await sleep(10000)
    }
}
