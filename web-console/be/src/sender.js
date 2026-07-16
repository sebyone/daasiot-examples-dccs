/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: sender.js
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * vincenzo.petrungaro@gmail.com - initial implementation
 * alessio.farfaglia@gmail.com - maintenance and updates
 */

const { DaasIoT } = require("daas-sdk");
const { decode, getTime } = require('./daas/utils');

console.log("SENDER")

const INET4 = 2;

const SID = 100;
const DIN = 102;
const URL = "127.0.0.1:2102"

const REMOTE_DIN = 101;
const REMOTE_URL = "127.0.0.1:2101";

const hver = "nodeJS";

const localNode = new DaasIoT(hver);

localNode.onDinConnected((din) => { console.log(getTime(), "📌 DIN Accepted: " + din); });

localNode.onDDOReceived((din) => {
    console.log(getTime(), "🔔 DDO received from DIN:", din);
    localNode.locate(din);

    localNode.pull(din, (origin, timestamp, typeset, data) => {
        let readableTimestamp = new Date(timestamp * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '')

        try {
            console.log(`⬇⬇ Pulling data from DIN: ${origin} | sent ${readableTimestamp} | typeset: ${typeset} | data:`);

            let decodedData = decode(data);
            decodedData = Buffer.from(decodedData, 'base64').toString('ascii');

            try {
                let parsedData = JSON.parse(decodedData);
                console.log(JSON.stringify(parsedData, null, 2));
            }
            catch (error) {
                console.log(decodedData);
            }

        } catch (error) {
            console.error(error);
        }
    });
});

localNode.doInit(SID, DIN);

if (localNode.enableDriver(INET4, URL)) {
    console.log(getTime(), "Driver enabled!");
}

localNode.map(REMOTE_DIN, INET4, REMOTE_URL);

if (localNode.doPerform()) {
    console.log(getTime(), "Node performed!");
}

console.log(getTime(), `🟢 DaasIoT Node enabled! (sid: ${SID} | din: ${DIN} | host: ${URL})`)

setInterval(() => {
    const located = localNode.locate(REMOTE_DIN);
    console.log(getTime(), `🔍 Locate ${REMOTE_DIN}: ${located}`);

    if (located) {
        const timestamp = Math.floor(new Date().getTime() / 1000);

        const payload = {
            message: "Ciao Mondo!!!"
        }

        localNode.push(REMOTE_DIN, 10, timestamp, JSON.stringify(payload));
        console.log(getTime(), `⬆⬆ Pushing data to ${REMOTE_DIN} done.`);
    }
}, 5000)
