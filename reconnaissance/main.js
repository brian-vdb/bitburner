import { getLinkedServers } from "./reconnaissance/network";

/** @param {import("../.").NS} ns */
export async function main(ns) {
    const host = ns.getHostname();
    const servers = [host];
    const targets = getLinkedServers(ns, host);
    ns.tprint(targets);
}
