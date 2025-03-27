/**
 * Main function to perform a weaken attack.
 *
 * @param {import("../index").NS} ns - The environment object.
 * @returns {Promise<void>} A promise that resolves when the script finishes.
 */
export async function main(ns) {
  const hostname = ns.args[0];
  const threads = parseInt(ns.args[1], 10);
  const additionalMsec = parseInt(ns.args[2], 10);

  // Perform the grow attack
  await ns.weaken(hostname, { threads: threads, additionalMsec: additionalMsec });
}
