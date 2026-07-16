/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: daas.service.js
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * vincenzo.petrungaro@gmail.com - initial implementation
 *
 */
const db = require("../db/models");
const Din = db.Din;
const DinLocal = db.DinLocal;
const DinLink = db.DinLink;
const DinHasDin = db.DinHasDin;

async function loadConfig(node, localDinId = Number.parseInt(process.env.DAAS_LOCAL_RECEIVER_ID || '1', 10)) {

    const dinLocal = await DinLocal.findByPk(localDinId, { raw: true, include: ['din'] });
    const dinLocalLinks = await DinLink.findAll({
        where: {
            din_id: localDinId
        },
        raw: true
    });

    if (dinLocal === null) {
        console.error(`[daas] ERROR while loading config: dinLocal not found`);
        return;
    }

    const sid = parseInt(dinLocal['din.sid']);
    const din = parseInt(dinLocal['din.din']);

    // Init nodo
    const initDone = node.doInit(sid, din);

    if (initDone) {
        console.log(`[daas] doInit sid=${sid} din=${din} OK`);
    } else {
        console.error(`[daas] doInit sid=${sid} din=${din} ERROR`);
    }



    // Enable node links
    dinLocalLinks.forEach((llink) => {
        let link = parseInt(llink.link);
        let url = llink.url;

        let isEnabled = node.enableDriver(link, url);
        if (isEnabled) {
            console.log(`[daas] enableDriver link=${link} url=${url} OK`);
        } else {
            console.log(`[daas] enableDriver link=${link} url=${url} ERROR`);
        }

    });



    const dinsToMap = await DinHasDin.findAll({
        where: {
            pdin_id: dinLocal.din_id,
        },
        include: [
            {
                model: Din,
                as: 'cdin',
                include: ['links']
            }
        ]
    });

    dinsToMap.forEach((d) => {
        const din = parseInt(d.cdin.din);
        const links = d.cdin.links;

        console.log('[daas] links for din', din, JSON.stringify(links, null, 4));

        if (!links || links.length == 0) {
            let driver = 2;
            let url = '0.0.0.0:0';
            map(din, driver, url);
        }
        else {
            links.forEach((link) => {
                const driver = parseInt(link.link);
                const url = link.url;
                map(din, driver, url);
            });
        }

        function map(din, driver, url) {
            try {
                const isMapped = node.map(din, driver, url);
                if (isMapped) {
                    console.log(`[daas] map din=${din} driver=${driver} url=${url} OK`);
                } else {
                    console.error(`[daas] ERROR while mapping din=${din} driver=${driver} url=${url}`);
                }
            }
            catch (e) {
                console.error(`[daas] ERROR while mapping din=${din} driver=${driver} url=${url}: ${e.message}`);
            }
        }
    });

    return {
        sid,
        din
    }
};

module.exports = {
    loadConfig,
    applyConfig: loadConfig
}
