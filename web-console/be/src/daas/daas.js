/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: daas.js
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * vincenzo.petrungaro@gmail.com - initial implementation
 * alessio.farfaglia@gmail.com - maintenance and updates
 */

const sdkPackage = require("daas-sdk/package.json");
const hver = "nodeJS";

let nodeInstance = null;

function loadNode() {
    if (!nodeInstance) {
        const { DaasIoT } = require('daas-sdk');
        nodeInstance = new DaasIoT(hver);
    }

    return nodeInstance;
}

function configure(sid, din, drivers = [], devices = []) {
    const node = loadNode();
    node.doInit(sid, din);

    drivers.forEach(driver => {
        node.enableDriver(driver.type, driver.url);
        console.log(`Driver ${driver.type} on ${driver.url} enabled.`);
    });

    devices.forEach(device => {
        node.map(device.din, device.driverType, device.url);
        console.log(`Device ${device.din} on ${device.driverType} : ${device.url} mapped.`);
    });

    return node;
}

function getNode() {
    return loadNode();
}

function getStatus() {
    return loadNode().getStatus();
}

function getVersion() {
    return {
        daasSdkPackage: sdkPackage.version,
        node: process.version,
        nodeAddonApi: process.versions.napi,
        nativeLoaded: nodeInstance !== null,
    };
}

function start() {
    return loadNode().doPerform();
}

function stop() {
    if (!nodeInstance) return true;
    return nodeInstance.doEnd();
}

function restart() {
    return loadNode().restart();
}

async function send(din, typeset, data) {
    const node = loadNode();
    const located = node.locate(din);

    if (!located) throw new Error(`Node ${din} could not be located!`)

    const timestampSeconds = Math.floor(new Date().getTime() / 1000);
    return node.push(din, typeset, timestampSeconds, data);
}

module.exports = {
    configure,
    start,
    stop,
    getNode,
    getStatus,
    getVersion,
    restart,
    send,
}
