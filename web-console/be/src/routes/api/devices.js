const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");
const carbone = require('carbone');
const { Device, DeviceModel, Din, DDO, DeviceFunction } = require('../../db/models');
const db = require('../../db/models');
const { getPaginationParams, getQuery, sendError, toPaginationData, addQuery } = require('./utilities');
const { PLACEHOLDER_DEVICE_MODEL_ID } = require('./deviceModels');

module.exports = {
    router
};


//#region Devices

router.get('/devices', async function (req, res) {
    try {
        const { limit, offset } = getPaginationParams(req);
        const q = getQuery(req);
        const where = q ? { name: { [Op.like]: `%${q}%` } } : {};
        const rowsAndCount = await Device.findAndCountAll({ where, limit, offset, include: ['device_model', 'din'] });

        res.send(addQuery(toPaginationData(rowsAndCount, limit, offset), q));

    } catch (err) {
        sendError(res, err);
    }
});

router.get('/devices/:id', async function (req, res) {
    try {
        const id = parseInt(req.params.id);

        const device = await Device.findByPk(id, { include: ['device_model', 'din'] });

        if (device === null) {
            res.status(404);
            throw new Error(`Dispositivo con id=${id} non trovato.`);
        }
        res.send(device);
    }
    catch (err) {
        sendError(res, err);
    }
});

router.post('/devices', async function (req, res) {
    try {
        const device = req.body;

        for (const field of ['din_id', 'name', 'serial']) {
            if (!device[field]) {
                res.status(400);
                throw new Error(`Il campo ${field} è obbligatorio.`);
            }
        }

        device.device_model_id = device.device_model_id || PLACEHOLDER_DEVICE_MODEL_ID;

        const din = await Din.findByPk(parseInt(device.din_id));
        if (din === null) {
            res.status(404);
            throw new Error(`Din con id=${device.din_id} non trovato.`);
        }

        const deviceModel = await DeviceModel.findByPk(parseInt(device.device_model_id));
        if (deviceModel === null) {
            res.status(404);
            throw new Error(`DeviceModel con id=${device.device_model_id} non trovato.`);
        }

        const newDevice = await Device.create(device);
        res.send(newDevice);
    }
    catch (err) {
        sendError(res, err);
    }
});


router.put('/devices/:id', async function (req, res) {
    const t = await db.sequelize.transaction();

    try {
        const id = parseInt(req.params.id);
        const device = req.body;

        const oldDevice = await Device.findByPk(id, { transaction: t });
        if (oldDevice === null) {
            res.status(404);
            throw new Error(`Dispositivo con id=${id} non trovato.`);
        }

        if (device.id && device.id !== id) {
            res.status(400);
            throw new Error(`Non è possibile modificare l'id del dispositivo.`);
        }

        // we're modifying the din
        if (device.din != undefined) {
            // we can't modify the din_id at the same time
            if (device.din_id && device.din_id !== oldDevice.din_id) {
                res.status(400);
                throw new Error(`Non è possibile modificare il din_id del dispositivo.`);
            }

            const din = device.din;
            const oldDin = await Din.findByPk(oldDevice.din_id, { transaction: t });

            if (oldDin === null) {
                res.status(404);
                throw new Error(`Din con id=${oldDevice.din_id} non trovato.`);
            }

            if (din.id && din.id !== oldDin.id) {
                res.status(400);
                throw new Error(`Non è possibile modificare l'id del din.`);
            }

            const updatedRowsDin = await Din.update(din, { where: { id: oldDin.id }, transaction: t });
            if (updatedRowsDin === 0) {
                res.status(404);
                throw new Error(`Non è stato possibile aggiornare il din con id=${oldDin.id}.`);
            }
            console.log(`[API] Updated din with id=${oldDin.id}`);
        }

        // we can't modify the device_model from here
        if (device.device_model != undefined) {
            res.status(400);
            throw new Error(`Non è possibile modificare il device_model del dispositivo da questo endpoint.`);
        }

        if (device.device_model_id != undefined && device.device_model_id !== oldDevice.device_model_id) {
            // we are changing the device model

            // the new device model must exist
            const newDeviceModel = await DeviceModel.findByPk(device.device_model_id, { transaction: t });
            if (newDeviceModel === null) {
                res.status(404);
                throw new Error(`DeviceModel con id=${device.device_model_id} non trovato.`);
            }

            // remove all device functions
            await DeviceFunction.destroy({ where: { device_id: oldDevice.id }, transaction: t });
        }

        const updatedRows = await Device.update(device, { where: { id }, transaction: t });

        if (updatedRows === 0) {
            res.status(404);
            throw new Error(`Non è stato possibile aggiornare il dispositivo con id=${id}.`);
        }

        await t.commit();
        res.send({ message: "Dispositivo aggiornato con successo." });
    }
    catch (err) {
        await t.rollback();
        sendError(res, err);
    }
});

router.delete('/devices/:id', async function (req, res) {
    try {
        const id = parseInt(req.params.id);
        const deletedRows = await Device.destroy({ where: { id } });

        if (deletedRows === 0) {
            res.status(404);
            throw new Error(`Dispositivo con id=${id} non trovato.`);
        }

        res.send({ message: "Dispositivo eliminato con successo." });
    }
    catch (err) {
        sendError(res, err);
    }
});

//#endregion

//#region DDOs

router.get('/devices/:id/ddos', async function (req, res) {
    const t = await db.sequelize.transaction();
    try {
        const { limit, offset } = getPaginationParams(req);
        const sent = req.query.sent === 'true';
        console.log(`[API] sent=${sent}`);

        const deviceId = parseInt(req.params.id);
        const device = await Device.findByPk(deviceId, { transaction: t });
        if (device === null) {
            res.status(404);
            throw new Error(`Dispositivo con id=${deviceId} non trovato.`);
        }

        let where = {};
        if (sent) {
            where = { din_id_src: device.din_id };
        }
        else {
            where = { din_id_dst: device.din_id };
        }
        const countAndData = await DDO.findAndCountAll({ where, limit, offset, transaction: t });
        await t.commit();

        res.send(toPaginationData(countAndData, limit, offset));
    }
    catch (err) {
        await t.rollback();
        sendError(res, err);
    }
});

router.get('/devices/:id/reports', async function (req, res) {
    try {
        const extension = req.query.extension || 'pdf';
        const deviceId = parseInt(req.params.id);

        const validExtensions = ['pdf', 'xlsx'];
        if (!validExtensions.includes(extension)) {
            res.status(415);
            throw new Error(`Estensione non valida. Le estensioni valide sono: ${validExtensions.join(', ')}.`);
        }

        const options = {
            convertTo: extension,
            lang: 'it',
            timezone: 'Europe/Rome'
        };

        const device = await Device.findByPk(deviceId);
        if (device === null) {
            res.status(404);
            throw new Error(`Dispositivo con id=${deviceId} non trovato.`);
        }

        const where = {
            [Op.or]: [
                { din_id_src: device.din_id },
                { din_id_dst: device.din_id }
            ]
        };

        let data = await DDO.findAll({ where, include: ['din_dst', 'din_src'], raw: true, nest: true });
        if (data.length === 0) {
            res.status(404);
            throw new Error(`Non ci sono DDO per il dispositivo con id=${deviceId}.`);
        }

        data[0].nodo = device.name;

        for (let i = 0; i < data.length; i++) {
            data[i].payload = Buffer.from(data[i].payload, 'base64').toString('utf-8');
        }

        const template = extension === 'pdf'
            ? 'static/public/reporting_templates/template_ddo_documenti.docx'
            : 'static/public/reporting_templates/template_ddo_tabelle.ods';

        // we transform the call to carbone.render into a promise so we can use async/await and better error handling
        const carboneRender = (template, data, options) => {
            return new Promise((resolve, reject) => {
                carbone.render(template, data, options, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        };


        const result = await carboneRender(template, data, options).catch(err => {
            res.status(500);
            console.log(err)
            throw new Error(`Errore durante la generazione del report`);
        });
        res.setHeader('Content-Type', extension === 'pdf' ? 'application/pdf' : 'application/xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="report${device.din_id}.${extension}"`);
        res.send(result);
    }
    catch (err) {
        sendError(res, err);
    }
});
