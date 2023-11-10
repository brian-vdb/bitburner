/**
 * Explores and maps the network and all of its nodes.
 *
 * @param {import("../.").NS} ns - The environment.
 * @param {string} host - The hostname of the server currently being scouted from
 * @param {string[]} servers - The list of servers that have been spotted
 * @returns {string[]} An array of server hostnames on the network.
 */
function reconnaissance(ns, host, servers) {
    servers.push(host);

    // Find the neighboring servers
    const targets = ns.scan(host);

    // Using forEach to iterate over the array
    targets.forEach((target) => {
        if (!servers.includes(target)) {
            servers = reconnaissance(ns, target, servers);
        }
    });

    return servers;
}

/** @param {import("../.").NS} ns */
export async function main(ns) {
    const host = ns.getHostname();
    let servers = [];
    
    // Get a list of all of the servers in the whole network
    servers = reconnaissance(ns, host, servers);
    ns.tprint(servers);
}
