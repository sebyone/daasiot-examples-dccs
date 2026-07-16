const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");
const { DinLocal, Din, DinLink, DinHasDin } = require('../../db/models');
const db = require("../../db/models");
const { sendError } = require('./utilities');

module.exports = {
    router
};


//#region Receivers

/**
 * Ritorna una lista di tutti i receivers.
 */
router.get('/receivers', async function (req, res) {
    try {
        const data = await DinLocal.findAll({ include: ['din', 'links', 'device'] });
        res.send(data);
    } catch (err) {
        sendError(res, err);
    }
});


router.get('/receivers/count', async function (req, res) {
    try {
        const count = await DinLocal.count();
        res.send({ count });
    } catch (err) {
        sendError(res, err);
    }
});


router.get('/receivers/:receiverId', async function (req, res) {
    try {
        const receiverId = parseInt(req.params.receiverId);
        const data = await DinLocal.findByPk(receiverId, { include: ['din', 'links', 'device'] });
        if (!data) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }

        res.send(data);
    } catch (err) {
        sendError(res, err);
    }
});


/**
 * Agguinge un nuovo receiver
 * 
 * @example curl -X POST -H "Content-Type: application/json" -d '{"din": {"sid": "100", "din": "87", "p_res": "000", "skey": "9efbaeb2a94f"}, "title": "Receiver 1"}' http://localhost:3000/api/receivers/
 */
router.post('/receivers', async function (req, res) {
    const t = await db.sequelize.transaction();

    try {
        const { din, links, ...dinLocal } = req.body;

        if (!din) {
            res.status(400);
            throw new Error("l'oggetto din è obbligatorio.");
        }

        const requiredFields = ['sid', 'din'];
        for (const field of requiredFields) {
            if (din[field] == undefined) {
                res.status(400);
                throw new Error(`Il campo din.${field} è obbligatorio.`);
            }
        }

        if (!dinLocal.title) {
            res.status(400);
            throw new Error("Il campo title è obbligatorio.");
        }


        if (links) {
            res.status(400);
            throw new Error("Non è possibile aggiungere i link durante la creazione del receiver, usa l'endpoint /receivers/:receiverId/links");
        }

        const newDin = await Din.create(din, { transaction: t });
        const newDinLocal = await DinLocal.create({ din_id: newDin.id, ...dinLocal }, { transaction: t });

        await t.commit();

        let data = await DinLocal.findByPk(newDinLocal.id, { include: ['din'] });
        data = data.toJSON();
        data.links = [];
        data.device = null;
        res.send(data);

    } catch (err) {
        await t.rollback();
        sendError(res, err);
    }
});

router.put('/receivers/:receiverId', async function (req, res) {
    const t = await db.sequelize.transaction();

    console.log(`PUT /config (req.body)`, req.body);
    try {
        const receiverId = parseInt(req.params.receiverId);

        const { din, links, ...dinLocal } = req.body;

        if (!din) {
            res.status(400);
            throw new Error("Il campo din è obbligatorio.");
        }

        if (links) {
            res.status(400);
            throw new Error("Non è possibile aggiungere i link durante la creazione del receiver, usa l'endpoint /api/receivers/:receiverId/links");
        }

        const oldDinLocal = await DinLocal.findByPk(receiverId, { transaction: t });
        if (!oldDinLocal) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }

        const oldDin = await Din.findByPk(oldDinLocal.din_id, { transaction: t });
        if (!oldDin) {
            res.status(404);
            throw new Error(`Din con id=${oldDinLocal.din_id} non trovato.`);
        }

        await DinLocal.update(dinLocal, { where: { id: receiverId }, transaction: t });
        await Din.update({ id: oldDinLocal.din_id, ...din }, { where: { id: oldDinLocal.din_id }, transaction: t });

        await t.commit();

        res.send({ message: "DinLocal aggiornato con successo." });
    } catch (err) {
        await t.rollback();
        sendError(res, err);
    }
});


router.delete('/receivers/:receiverId', async function (req, res) {
    const receiverId = parseInt(req.params.receiverId);
    const t = await db.sequelize.transaction();

    try {
        if (receiverId === 1) {
            res.status(403);
            throw new Error("Non è possibile eliminare il receiver con id=1.");
        }

        const receiver = await DinLocal.findByPk(receiverId, { transaction: t });

        if (receiver === null) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }

        const mappedDins = await DinHasDin.findAll({ where: { pdin_id: receiver.din_id }, transaction: t });
        if (mappedDins.length > 0) {
            res.status(409);
            const mappedDinsIds = mappedDins.map(m => m.cdin_id);
            throw new Error(`Non è possibile eliminare il receiver con id=${receiverId} perché ha nodi remoti mappati: ${mappedDinsIds.join(', ')}.`);
        }

        const deletedDinLocalRows = await DinLocal.destroy({ where: { id: receiverId }, transaction: t });
        const deletedDinRows = await Din.destroy({ where: { id: receiver.din_id }, transaction: t });

        if (deletedDinLocalRows == 0 || deletedDinRows == 0) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }

        await t.commit();

        res.send({ message: "Receiver eliminato con successo." });
    } catch (err) {
        await t.rollback();
        sendError(res, err);
    }
});


//#endregion

//#region Receivers links

router.get('/receivers/:receiverId/links', async function (req, res) {
    try {
        const receiverId = parseInt(req.params.receiverId);
        const receiver = await DinLocal.findByPk(receiverId, { include: ['links'] });
        res.send(receiver.links);
    } catch (err) {
        sendError(res, err);
    }
});

router.get('/receivers/:receiverId/links/:id', async function (req, res) {

    try {
        const linkId = parseInt(req.params.id);
        const receiverId = parseInt(req.params.receiverId);

        const data = await DinLink.findByPk(linkId);
        if (data === null) {
            res.status(404);
            throw new Error(`Link con id=${linkId} non trovato.`);
        }

        const dinLocal = await DinLocal.findByPk(data.din_id);
        if (dinLocal === null) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }

        if (data.din_id !== dinLocal.din_id) {
            res.status(403);
            throw new Error(`Link con id=${linkId} non appartiene al receiver con id=${receiverId}.`);
        }

        res.send(data);
    } catch (err) {
        sendError(res, err);
    }
});

router.post('/receivers/:receiverId/links', async function (req, res) {
    try {
        const receiverId = parseInt(req.params.receiverId);

        if (!req.body.url) {
            res.status(400);
            throw new Error("Il campo url è obbligatorio.");
        }
        if (!req.body.link) {
            res.status(400);
            throw new Error("Il campo link è obbligatorio.");
        }
        // check that req.body.link is 1, 2, 3 or 4
        const link = parseInt(req.body.link);
        if (![1, 2, 3, 4].includes(link)) {
            res.status(400);
            throw new Error(`Il campo link deve essere 1, 2, 3 o 4, invece è ${req.body.link}.`);
        }

        const dinLocal = await DinLocal.findByPk(receiverId);

        if (dinLocal === null) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }

        const dinLink = await DinLink.create({ din_id: dinLocal.din_id, ...req.body });

        res.send(dinLink);
    } catch (err) {
        sendError(res, err);
    }
});

router.put('/receivers/:receiverId/links/:id', async function (req, res) {
    const linkId = parseInt(req.params.id);
    const receiverId = parseInt(req.params.receiverId);
    const { id, din_id, ...rest } = req.body;
    try {
        const dinLocal = await DinLocal.findByPk(receiverId);
        const oldLink = await DinLink.findByPk(linkId);

        if (oldLink == null) {
            res.status(404);
            throw new Error(`Link con id=${linkId} non trovato.`);
        }

        if (dinLocal === null) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }

        if (oldLink.din_id !== dinLocal.din_id) {
            res.status(403);
            throw new Error(`Link con id=${linkId} non appartiene al receiver con id=${receiverId}.`);
        }

        const updatedRows = await DinLink.update({ ...rest, din_id: dinLocal.din_id }, { where: { id: linkId } });

        if (!updatedRows) {
            res.status(404);
            throw new Error(`Link con id=${linkId} non trovato.`);
        }

        res.send({ message: "Link aggiornato con successo." });
    } catch (err) {
        sendError(res, err);
    }
});

router.delete('/receivers/:receiverId/links/:id', async function (req, res) {
    const id = parseInt(req.params.id);
    const receiverId = parseInt(req.params.receiverId);
    try {
        const dinLocal = await DinLocal.findByPk(receiverId);
        const link = await DinLink.findByPk(id);

        if (link === null) {
            res.status(404);
            throw new Error(`Link con id=${id} non trovato.`);
        }
        if (dinLocal === null) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }
        if (link.din_id !== dinLocal.din_id) {
            res.status(403);
            throw new Error(`Link con id=${id} non appartiene al receiver con id=${receiverId}.`);
        }

        const deletedRows = await DinLink.destroy({ where: { id: id }, force: true });

        if (deletedRows == 0) {
            res.status(404)
            throw new Error(`Link con id=${id} non trovato.`);
        }

        res.send({ message: "Link eliminato con successo." });
    } catch (err) {
        sendError(res, err);
    }
});

//#endregion

//#region DINs


router.get('/dins/', async function (req, res) {
    try {
        const data = await Din.findAll();
        res.send(data);
    } catch (err) {
        sendError(res, err);
    }
});

//#endregion

//#region Remotes

router.get('/remotes/', async function (req, res) {
    try {
        const allReceivers = await DinLocal.findAll();
        const allReceiversDinsIds = allReceivers.map(r => r.din_id);

        const allRemotesDins = await Din.findAll({
            where: {
                id: {
                    // NOT IN -> troviamo tutti i dins non hanno associato un receiver e quindi sono remote
                    [Op.notIn]: allReceiversDinsIds
                }
            },
            include: ['links']
        });

        res.send(allRemotesDins);
    } catch (err) {
        sendError(res, err);
    }
});


router.get('/remotes/count', async function (req, res) {
    try {
        const allReceivers = await DinLocal.findAll();
        const allReceiversDinsIds = allReceivers.map(r => r.din_id);

        const count = await Din.count({
            where: {
                id: {
                    // NOT IN -> troviamo tutti i dins non hanno associato un receiver e quindi sono remote
                    [Op.notIn]: allReceiversDinsIds
                }
            }
        });

        res.send({ count });
    } catch (err) {
        sendError(res, err);
    }
});



// Restituisce i nodi mappati sul receiver (id=receiverId)
router.get('/receivers/:receiverId/remotes', async function (req, res) {
    const receiverId = parseInt(req.params.receiverId);

    try {
        const receiver = await DinLocal.findByPk(receiverId);
        if (receiver === null) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }
        const mappedDins = await DinHasDin.findAll({
            where: { pdin_id: receiver.din_id },
            include: [
                {
                    model: Din,
                    as: 'cdin',
                    include: ['links', 'receiver']
                }
            ]
        });

        res.send(mappedDins);
    } catch (err) {
        sendError(res, err);
    }
});

// Restituisce il nodo (id=id) del receiver (id=receiverId)
router.get('/receivers/:receiverId/remotes/:id', async function (req, res) {
    const receiverId = parseInt(req.params.receiverId);
    const dinId = parseInt(req.params.id);

    try {

        const receiver = await DinLocal.findByPk(receiverId);
        if (receiver === null) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }

        const mappedDin = await DinHasDin.findOne({
            where: { pdin_id: receiver.din_id, cdin_id: dinId },
            include: [
                {
                    model: Din,
                    as: 'cdin',
                    include: ['links', 'receiver']
                }
            ]
        });

        if (mappedDin === null) {
            res.status(404);
            throw new Error(`Non è stato trovato un nodo mappato con id=${dinId} dal receiver con id=${receiverId}.`);
        }

        res.send(mappedDin);
    } catch (err) {
        sendError(res, err);
    }
});


/**
 * Associa o crea (map) un nodo remoto al receiver (id=receiverId)
 * Se il node non esiste nella tabella Din, lo crea e poi lo associa.
 * 
 * @example curl -X POST -H "Content-Type: application/json" -d '{"din": {"sid": "100", "din": "87", "p_res": "000", "skey": "9efbaeb2a94f"}}' http://localhost:3000/api/receivers/1/remotes/
 * 
 * @example curl -X POST -H "Content-Type: application/json" -d '{"din": {"id": "2"}}' http://localhost:3000/api/receivers/1/remotes/
 * 
 */
router.post('/receivers/:receiverId/remotes/', async function (req, res) {
    const t = await db.sequelize.transaction();
    const receiverId = parseInt(req.params.receiverId);
    let remoteDin = null;
    try {
        const receiver = await DinLocal.findByPk(receiverId, { include: ['din'] });
        if (receiver === null) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }

        const { din } = req.body;

        if (!din) {
            res.status(400);
            throw new Error("l'oggetto din è obbligatorio.");
        }

        if (!din.id) {
            // se non è stato passato l'id del din, lo creo
            const requiredFields = ['sid', 'din'];
            for (const field of requiredFields) {
                if (!din[field]) {
                    res.status(400);
                    throw new Error(`Non è stato possibile creare un nodo remoto, il campo din.${field} è obbligatorio`);
                }
            }
            remoteDin = await Din.create(din, { transaction: t });
        }
        else {
            // se è stato passato l'id del din fai un update e poi lo associ
            remoteDin = await Din.findByPk(din.id);
            if (remoteDin === null) {
                res.status(404);
                throw new Error(`Din con id=${din.id} non trovato.`);
            }
            await Din.update(din, { where: { id: din.id }, transaction: t });
        }

        if (!remoteDin) {
            res.status(400);
            throw new Error("Non è stato possibile creare un nodo remoto.");
        }

        if (remoteDin.id === receiver.din_id) {
            res.status(400);
            throw new Error("Non è possibile mappare un nodo remoto a se stesso.");
        }

        // se è stato passato il link, lo aggiungo
        const { link } = req.body;
        let linkId = null;
        if (link && link.link && link.url) {
            if (![1, 2, 3, 4].includes(link.link)) {
                res.status(400);
                throw new Error("Il campo link.link deve essere 1, 2, 3 o 4.");
            }

            linkId = parseInt(link.id);
            if (linkId) {
                // se è stato passato l'id del link fai un update
                const oldLink = await DinLink.findByPk(linkId);
                if (oldLink === null) {
                    res.status(404);
                    throw new Error(`Link con id=${linkId} non trovato.`);
                }
                if (oldLink.din_id !== remoteDin.id) {
                    res.status(403);
                    throw new Error(`Il link con id=${linkId} non appartiene al nodo remoto con id=${remoteDin.id}.`);
                }

                const linkUpdate = oldLink.update({ link: link.link, url: link.url }, { transaction: t });
                if (!linkUpdate) {
                    res.status(404);
                    throw new Error(`Link con id=${linkId} non trovato.`);
                }

            }
            else {
                // se non è stato passato l'id del link, lo creo
                await DinLink.create({ din_id: remoteDin.id, ...link }, { transaction: t });
            }
        }



        // does the receiver already have the remote din mapped?
        let mappedDin = await DinHasDin.findOne({
            where: {
                pdin_id: receiver.din_id,
                cdin_id: remoteDin.id
            },
            transaction: t
        });


        if (mappedDin === null) {
            console.log(`[API] receiver (id ${receiver.id}, din_id ${receiver.din_id}) ${receiver.din.din} Mapping remote din (id ${remoteDin.id}) ${remoteDin.din} to `);

            mappedDin = await DinHasDin.create({
                pdin_id: receiver.din_id,
                cdin_id: remoteDin.id
            }, {
                transaction: t
            });
        }

        await t.commit();

        const mappedDinData = await DinHasDin.findByPk(remoteDin.id, {
            include: [
                {
                    model: Din,
                    as: 'cdin',
                    include: ['links', 'receiver']
                }
            ]
        });

        res.send(mappedDinData);
    } catch (err) {
        await t.rollback();
        sendError(res, err);
    }

    if (remoteDin && parseInt(remoteDin.din)) {
        try {
            const daasApi = req.app.get('daasApi');
            daasApi.getNode().map(parseInt(remoteDin.din));
            console.log(`[API] Mapped remote din ${remoteDin.din}`);
        } catch (err) {
            console.error(`[API] Errore durante il mapping del nodo remoto ${remoteDin.din}:`, err);
        }
    }

});



/**
 * Elimina l’associazione (map) tra il nodo remoto e il receivers
 * Se, eliminando questa associazione, il nodo remoto non ha più associazioni, il nodo viene cancellato
 */
router.delete('/receivers/:receiverId/remotes/:id', async function (req, res) {
    const id = parseInt(req.params.id);
    const receiverId = parseInt(req.params.receiverId);

    try {

        const receiver = await DinLocal.findByPk(receiverId);
        if (receiver === null) {
            res.status(404);
            throw new Error(`Receiver con id=${receiverId} non trovato.`);
        }

        const dinToDelete = await DinHasDin.findOne({ where: { pdin_id: receiver.din_id, cdin_id: id } });
        if (dinToDelete === null) {
            res.status(404);
            throw new Error(`Non è stato trovato un nodo mappato con id=${id} dal receiver con id=${receiverId}.`);
        }

        const deletedMaps = await DinHasDin.destroy({ where: { pdin_id: receiver.din_id, cdin_id: id } });
        console.log(`[API] deletedMaps`, deletedMaps);

        if (deletedMaps == 0) {
            res.status(404)
            throw new Error(`Non è stato trovato un nodo remoto con id=${id}.`);
        }

        // is the remote a receiver?
        const remoteDin = await DinLocal.findOne({ where: { din_id: id } });

        if (!remoteDin) {
            // get the number of receivers that have the remote din mapped
            const receiversWithRemoteDinMapped = await DinHasDin.count({ where: { cdin_id: id } });
            console.log(`[API] receiversWithRemoteDinMapped`, receiversWithRemoteDinMapped);

            // if the remote din is not mapped to any receiver, delete it
            if (receiversWithRemoteDinMapped === 0) {
                const deletedDins = await Din.destroy({ where: { id }, cascade: true });
                console.log(`[API] deletedDins`, deletedDins);

                if (deletedDins === 0) {
                    res.status(404)
                    throw new Error(`Non è stato trovato un nodo remoto con id=${id}.`);
                }
            }
        }
        else {
            console.log(`[API] delete remote din ${id} mapping from receiver ${receiverId}, but remote din is a receiver.`);
        }

        res.send({ message: "Mapping eliminato eliminato con successo." });
    } catch (err) {
        sendError(res, err);
    }
});

/**
 *  Elimina tutte le associazioni (map) tra il receiver e i nodi remoti
 * I nodi remoti, che restano senza associazione, vengono cancellati.
 */
router.delete('/receivers/:receiverId/remotes', async function (req, res) {
    // TODO: IMPLEMENT
    sendError(res, new Error("Not yet implemented."), 501);
});
