const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");
const { DeviceModelGroup, DeviceModel } = require('../../db/models');
const { getPaginationParams, getQuery, sendError, toPaginationData, addQuery } = require('./utilities');

const DEFAULT_DEVICE_MODEL_GROUP_ID = 1;

module.exports = {
    router,
    DEFAULT_DEVICE_MODEL_GROUP_ID
};

router.get('/device_model_groups', async function (req, res) {
    try {
        const { limit, offset } = getPaginationParams(req);
        const q = getQuery(req);
        const where = q ? { title: { [Op.like]: `%${q}%` } } : {};
        const rowsAndCount = await DeviceModelGroup.findAndCountAll({ where, limit, offset });
        res.send(addQuery(toPaginationData(rowsAndCount, limit, offset), q));
    }
    catch (err) {
        sendError(res, err);
    }
});

router.get('/device_model_groups/:deviceModelGroupId', async function (req, res) {
    try {
        const id = parseInt(req.params.deviceModelGroupId);
        const deviceModelGroup = await DeviceModelGroup.findByPk(id);

        if (deviceModelGroup === null) {
            res.status(404);
            throw new Error(`DeviceModelGroup con id=${id} non trovato.`);
        }

        res.send(deviceModelGroup);
    }
    catch (err) {
        sendError(res, err);
    }
});


router.post('/device_model_groups', async function (req, res) {
    try {
        const deviceModelGroup = req.body;

        if (!deviceModelGroup.title) {
            res.status(400);
            throw new Error("Il campo title è obbligatorio, non può essere vuoto e deve essere diverso da gli altri title già presenti.");
        }

        const newDeviceModelGroup = await DeviceModelGroup.create(deviceModelGroup);
        res.send(newDeviceModelGroup);
    }
    catch (err) {
        sendError(res, err);
    }
});


router.put('/device_model_groups/:deviceModelGroupId', async function (req, res) {
    try {
        const id = parseInt(req.params.deviceModelGroupId);
        const deviceModelGroup = req.body;

        const oldDeviceModelGroup = await DeviceModelGroup.findByPk(id);
        if (oldDeviceModelGroup === null) {
            res.status(404);
            throw new Error(`DeviceModelGroup con id=${id} non trovato.`);
        }

        if (deviceModelGroup.id && deviceModelGroup.id !== id) {
            res.status(400);
            throw new Error(`Non è possibile modificare l'id del device_model_group.`);
        }

        const updatedRows = await DeviceModelGroup.update(deviceModelGroup, { where: { id } });

        if (updatedRows === 0) {
            res.status(404);
            throw new Error(`Non è stato possibile aggiornare il device_model_group con id=${id}.`);
        }

        res.send({ message: "DeviceModelGroup aggiornato con successo." });
    }
    catch (err) {
        sendError(res, err);
    }
});

router.delete('/device_model_groups/:deviceModelGroupId', async function (req, res) {
    try {
        const id = parseInt(req.params.deviceModelGroupId);

        if (id === DEFAULT_DEVICE_MODEL_GROUP_ID) {
            res.status(400);
            throw new Error(`Non è possibile eliminare il device_model_group con id=${id}.`);
        }

        const deletedRows = await DeviceModelGroup.destroy({ where: { id } });

        if (deletedRows === 0) {
            res.status(404);
            throw new Error(`DeviceModelGroup con id=${id} non trovato.`);
        }
        res.send({ message: "DeviceModelGroup eliminato con successo." });
    }
    catch (err) {
        sendError(res, err);
    }
});


router.get('/device_model_groups/:deviceModelGroupId/device_models', async function (req, res) {
    try {
        const deviceModelGroupId = parseInt(req.params.deviceModelGroupId);
        const { limit, offset } = getPaginationParams(req);
        const q = getQuery(req);

        const deviceModelGroup = await DeviceModelGroup.findByPk(deviceModelGroupId);
        if (deviceModelGroup === null) {
            res.status(404);
            throw new Error(`DeviceModelGroup con id=${deviceModelGroupId} non trovato.`);
        }
        // the query is contained in the description or name
        const where = q ? {
            [Op.or]: [
                { description: { [Op.like]: `%${q}%` } },
                { name: { [Op.like]: `%${q}%` } }
            ]
        } : {};
        where.device_group_id = deviceModelGroupId;

        const rowsAndCount = await DeviceModel.findAndCountAll({ where, limit, offset, include: ['resources'], subQuery: true });

        res.send(addQuery(toPaginationData(rowsAndCount, limit, offset), q));
    }
    catch (err) {
        sendError(res, err)
    }

});
