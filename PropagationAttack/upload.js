/*
   Brian van den Berg
   File: upload.js
   Description: This file contains functions related to uploading files to servers.
*/

/**
 * Uploads all of the scripts in the public folder to a server
 *
 * @param {import("../index").NS} ns - The environment object.
 * @param {string} hostname - Hostname of the server uploading.
 * @param {string} target - The server to upload to.
 * @returns {void}
 */
export function uploadPublicScriptsToServer(ns, hostname, target) {
   ns.tprint(ns.ls(hostname, 'public/'));
}
