/** @param {import("../index").NS} ns */
export async function main(ns) {
    const host = ns.getHostname();
    let hostnames = [];
    
    // Get a list of all of the hostnames in the whole network
    hostnames = _propagateNetwork(ns, host, hostnames);

    // Get the list of available hacking methods
    const hacks = getAvailableHacks(ns);

    // Hack into every vulnerable server in the network
    hostnames.forEach((hostname) => {
        intrudeServer(ns, hacks, hostname);
    });

    // Save the list of hostnames for future reference
    saveArrayAsJSON(ns, hostnames, 'servers.txt');
}
