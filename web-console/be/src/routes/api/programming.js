const express = require('express');
const router = express.Router();

const { sendError, getPaginationParams, toPaginationData } = require('./utilities');
const { DeviceModel, DeviceModelFunction, DeviceModelFunctionProperty, DeviceFunction, DeviceFunctionProperty, Device } = require('../../db/models');
const db = require('../../db/models');
const daas = require('../../daas/daas');

module.exports = {
  router,
  createDeviceModelFunction,
};

const DEV_MOD_PROPERTY_TYPE_LIST = ['parameters', 'inputs', 'outputs', 'notifications'];

const DEV_MOD_PROPERTY_TYPE_MAP = {
  1: 'parameters',
  2: 'inputs',
  3: 'outputs',
  4: 'notifications'
}

const DEV_MOD_PROPERTY_TYPE_MAP_REVERSE = {
  'parameters': 1,
  'inputs': 2,
  'outputs': 3,
  'notifications': 4
}

const DEV_MOD_DEFAULT_VALUE_MAP = {
  // i32
  1: '0',
  // i06
  2: '0',
  // f32
  3: '0.0',
  // string
  4: '',
  // i8
  5: '0',
  // i64
  6: '0',
  // f64
  7: '0.0',
}

router.get('/device_models/any/functions/', async function (req, res) {
  try {
    const { limit, offset } = getPaginationParams(req);

    const deviceModelFunctions = await DeviceModelFunction.findAndCountAll({
      include: [
        'parameters', 'inputs', 'outputs', 'notifications'
      ],
      subQuery: true,
      limit, offset,
    });


    res.send(toPaginationData(deviceModelFunctions, limit, offset));
  }
  catch (err) {
    sendError(res, err);
  }
});

router.get('/device_models/:deviceModelId/functions/', async function (req, res) {
  const deviceModelId = parseInt(req.params.deviceModelId);
  try {
    const deviceModel = await DeviceModel.findByPk(deviceModelId, {
      include: [
        {
          model: DeviceModelFunction,
          as: 'functions',
          include: DEV_MOD_PROPERTY_TYPE_LIST
        }
      ]
    });

    if (deviceModel === null) {
      res.status(404);
      throw new Error(`DeviceModel con id=${deviceModelId} non trovato.`);
    }

    res.send(deviceModel.functions);
  }
  catch (err) {
    sendError(res, err);
  }
});

router.get('/device_models/:deviceModelId/functions/:dmFuntionId', async function (req, res) {
  try {
    const deviceModelId = parseInt(req.params.deviceModelId);
    const dmFuntionId = parseInt(req.params.dmFuntionId);

    const deviceModelFunction = await DeviceModelFunction.findByPk(dmFuntionId, {
      include: DEV_MOD_PROPERTY_TYPE_LIST
    });

    if (deviceModelFunction === null) {
      res.status(404);
      throw new Error(`DeviceModelFunction con id=${dmFuntionId} non trovato.`);
    }


    if (deviceModelFunction.device_model_id !== deviceModelId) {
      res.status(404);
      throw new Error(`DeviceModelFunction con id=${dmFuntionId} non appartiene al DeviceModel con id=${deviceModelId}.`);
    }

    res.send(deviceModelFunction);
  }
  catch (err) {
    sendError(res, err);
  }
});

router.post('/device_models/:deviceModelId/functions/', async function (req, res) {
  const t = await db.sequelize.transaction();
  try {
    const deviceModelId = parseInt(req.params.deviceModelId);
    const deviceModelFunction = req.body;

    const deviceModelFunctionWithProperties = await createDeviceModelFunction(req, res, deviceModelId, deviceModelFunction, t);

    await t.commit();
    res.send(deviceModelFunctionWithProperties);
  }
  catch (err) {
    await t.rollback();
    sendError(res, err);
  }
});



// router.put('/device_models/:deviceModelId/functions/:dmFuntionId', async function (req, res) {
//   const t = await db.sequelize.transaction();
//   try {
//     const deviceModelId = parseInt(req.params.deviceModelId);
//     const dmFuntionId = parseInt(req.params.dmFuntionId);
//     const deviceModelFunction = req.body;

//     if (!deviceModelFunction) {
//       res.status(400);
//       throw new Error("Il body della richiesta è vuoto.");
//     }

//     if (deviceModelFunction.device_model_id && deviceModelFunction.device_model_id !== deviceModelId) {
//       res.status(400);
//       throw new Error("Il campo device_model_id non corrisponde all'id del DeviceModel.");
//     }

//     const oldDeviceModelFunction = await DeviceModelFunction.findByPk(dmFuntionId, { transaction: t, include: DEV_MOD_PROPERTY_TYPE_LIST });

//     if (oldDeviceModelFunction === null) {
//       res.status(404);
//       throw new Error(`DeviceModelFunction con id=${dmFuntionId} non trovato.`);
//     }

//     if (oldDeviceModelFunction.device_model_id !== deviceModelId) {
//       res.status(404);
//       throw new Error(`DeviceModelFunction con id=${dmFuntionId} non appartiene al DeviceModel con id=${deviceModelId}.`);
//     }

//     if (deviceModelFunction.device_model_id) {
//       oldDeviceModelFunction.device_model_id = deviceModelFunction.device_model_id;
//     }

//     if (deviceModelFunction.name) {
//       oldDeviceModelFunction.name = deviceModelFunction.name;
//     }

//     for (const property_list of DEV_MOD_PROPERTY_TYPE_LIST) {
//       if (deviceModelFunction[property_list]) {
//         for (const property of deviceModelFunction[property_list]) {
//           if (property.id) {
//             const oldProperty = oldDeviceModelFunction[property_list].find(p => p.id === property.id);
//             if (oldProperty) {
//               await updateDeviceModelFunctionProperty(res, oldProperty, property, oldDeviceModelFunction, t);
//             }
//             else {
//               res.status(404);
//               throw new Error(`Property con id=${property.id} non trovato.`);
//             }
//           }
//           else {
//             const property_type = DEV_MOD_PROPERTY_TYPE_MAP_REVERSE[property_list]
//             await createDeviceModelFunctionProperty(res, property, oldDeviceModelFunction, property_type, t);
//           }
//         }
//       }
//     }

//     const updated = await oldDeviceModelFunction.save({ transaction: t });

//     if (!updated) {
//       res.status(500);
//       throw new Error("Errore durante il salvataggio del DeviceModelFunction.");
//     }

//     await t.commit();

//     res.send({ message: `DeviceModelFunction con id=${dmFuntionId} aggiornato con successo.`});
//   }
//   catch (err) {
//     await t.rollback();
//     sendError(res, err);
//   }

// });


// router.delete('/device_models/:deviceModelId/functions/:dmFuntionId', async function (req, res) {
//   const t = await db.sequelize.transaction();
//   try {
//     const deviceModelId = parseInt(req.params.deviceModelId);
//     const dmFuntionId = parseInt(req.params.dmFuntionId);

//     const deviceModelFunction = await DeviceModelFunction.findByPk(dmFuntionId, { transaction: t });

//     if (deviceModelFunction === null) {
//       res.status(404);
//       throw new Error(`DeviceModelFunction con id=${dmFuntionId} non trovato.`);
//     }

//     if (deviceModelFunction.device_model_id !== deviceModelId) {
//       res.status(404);
//       throw new Error(`DeviceModelFunction con id=${dmFuntionId} non appartiene al DeviceModel con id=${deviceModelId}.`);
//     }

//     await deviceModelFunction.destroy({ transaction: t });
//     await t.commit();
//     res.send({ message: `DeviceModelFunction con id=${dmFuntionId} eliminato con successo.`});
//   }
//   catch (err) {
//     await t.rollback();
//     sendError(res, err);
//   }
// });


// router.delete('/device_models/:deviceModelId/functions/:dmFuntionId/properties/:propertyId', async function (req, res) {
//   const t = await db.sequelize.transaction();
//   try {
//     const deviceModelId = parseInt(req.params.deviceModelId);
//     const dmFuntionId = parseInt(req.params.dmFuntionId);
//     const propertyId = parseInt(req.params.propertyId);

//     const property = await DeviceModelFunctionProperty.findByPk(propertyId, { transaction: t });

//     if (property === null) {
//       res.status(404);
//       throw new Error(`Property con id=${propertyId} non trovato.`);
//     }

//     if (property.function_id !== dmFuntionId) {
//       res.status(404);
//       throw new Error(`Property con id=${propertyId} non appartiene alla DeviceModelFunction con id=${dmFuntionId}.`);
//     }

//     const deviceModelFunction = await DeviceModelFunction.findByPk(dmFuntionId, { transaction: t });

//     if (deviceModelFunction === null) {
//       res.status(404);
//       throw new Error(`DeviceModelFunction con id=${dmFuntionId} non trovato.`);
//     }

//     if (deviceModelFunction.device_model_id !== deviceModelId) {
//       res.status(404);
//       throw new Error(`DeviceModelFunction con id=${dmFuntionId} non appartiene al DeviceModel con id=${deviceModelId}.`);
//     }

//     await property.destroy({ transaction: t });
//     await t.commit();
//     res.send({ message: `Property '${property.name}' con id=${propertyId} eliminata con successo.`});
//   }
//   catch (err) {
//     await t.rollback();
//     sendError(res, err);
//   }
// });


router.get('/devices/:deviceId/functions/', async function (req, res) {
  const deviceId = parseInt(req.params.deviceId);
  try {

    const deviceFunctions = await DeviceFunction.findAll({
      where: { device_id: deviceId },
      include: [
        {
          model: DeviceModelFunction,
          as: 'function',
          include: DEV_MOD_PROPERTY_TYPE_LIST,
        },
        'parameters',
        'inputs',
        'outputs',
        'notifications'
      ]
    });


    let deviceFunctionsJSON = [];
    for (const deviceFunction of deviceFunctions) {
      deviceFunctionsJSON.push(addPropertyTemplateToDeviceFunction(deviceFunction));
    }
    res.send(deviceFunctionsJSON);
  }
  catch (err) {
    sendError(res, err);
  }

});

router.get('/devices/:deviceId/functions/:dFuntionId', async function (req, res) {
  const deviceId = parseInt(req.params.deviceId);
  const deviceFuntionId = parseInt(req.params.dFuntionId);

  try {
    const deviceFunction = await DeviceFunction.findByPk(deviceFuntionId, {
      where: { device_id: deviceId },
      include: [
        {
          model: DeviceModelFunction,
          as: 'function',
          include: DEV_MOD_PROPERTY_TYPE_LIST
        },
        ...DEV_MOD_PROPERTY_TYPE_LIST,
      ]
    });

    if (deviceFunction === null) {
      res.status(404);
      throw new Error(`DeviceFunction con id=${deviceFuntionId} non trovato.`);
    }

    const deviceFunctionJSON = addPropertyTemplateToDeviceFunction(deviceFunction);
    res.send(deviceFunctionJSON);
  }
  catch (err) {
    sendError(res, err);
  }
});

router.post('/devices/:deviceId/functions/', async function (req, res) {
  // select salva l'id della funzione


  // creare riga per il device dove salva l'ID della funzione e un campo selected
  // id_device_function


  const t = await db.sequelize.transaction();
  const deviceId = parseInt(req.params.deviceId);

  try {
    const deviceFunction = req.body;

    if (!deviceFunction) {
      res.status(400);
      throw new Error("Il body della richiesta è vuoto.");
    }

    if (!deviceFunction.device_model_function_id) {
      res.status(400);
      throw new Error("Il campo device_model_function_id è obbligatorio.");
    }

    const deviceModelFunction = await DeviceModelFunction.findByPk(deviceFunction.device_model_function_id, { transaction: t, include: DEV_MOD_PROPERTY_TYPE_LIST });

    if (deviceModelFunction === null) {
      res.status(404);
      throw new Error(`DeviceModelFunction con id=${deviceFunction.device_model_function_id} non trovato.`);
    }

    const device = await Device.findByPk(deviceId, { transaction: t });

    if (deviceModelFunction.device_model_id !== device.device_model_id) {
      res.status(404);
      throw new Error(`DeviceModelFunction con id=${deviceFunction.device_model_function_id} appartiene al DeviceModel con id=${deviceModelFunction.device_model_id} e non al Device con device_model_id=${device.device_model_id}.`);
    }

    const newDeviceFunction = await DeviceFunction.create({
      device_id: deviceId,
      device_model_function_id: deviceFunction.device_model_function_id,
      enabled: true
    }, { transaction: t });

    for (const property_list of DEV_MOD_PROPERTY_TYPE_LIST) {
      const property_type = DEV_MOD_PROPERTY_TYPE_MAP_REVERSE[property_list];

      if (deviceModelFunction[property_list]) {
        for (const property of deviceModelFunction[property_list]) {
          await DeviceFunctionProperty.create({
            property_id: property.id,
            device_function_id: newDeviceFunction.id,
            property_type,
            value: property.default_value
          }, { transaction: t });
        }
      }
    }

    const deviceFunctionWithProperties = await DeviceFunction.findByPk(newDeviceFunction.id, {
      include: [
        {
          model: DeviceModelFunction,
          as: 'function',
          include: DEV_MOD_PROPERTY_TYPE_LIST
        },
        ...DEV_MOD_PROPERTY_TYPE_LIST,
      ],
      transaction: t,
    });

    const deviceFunctionJSON = addPropertyTemplateToDeviceFunction(deviceFunctionWithProperties);

    await t.commit();
    res.send(deviceFunctionJSON);
  }
  catch (err) {
    await t.rollback();
    sendError(res, err);
  }
});


router.put('/devices/:deviceId/functions/:dFuntionId', async function (req, res) {
  const t = await db.sequelize.transaction();

  try {
    const deviceId = parseInt(req.params.deviceId);
    const deviceFuntionId = parseInt(req.params.dFuntionId);
    const deviceFunction = req.body;

    if (!deviceFunction) {
      res.status(400);
      throw new Error("Il body della richiesta è vuoto.");
    }

    if (deviceFunction.device_id && deviceFunction.device_id !== deviceId) {
      res.status(400);
      throw new Error("Il campo device_id non corrisponde all'id del Device.");
    }

    if (deviceFunction.id && deviceFunction.id !== deviceFuntionId) {
      res.status(400);
      throw new Error("Il campo id non corrisponde all'id del DeviceFunction.");
    }

    const oldDeviceFunction = await DeviceFunction.findByPk(deviceFuntionId, {
      transaction: t,
      include: [
        {
          model: DeviceModelFunction,
          as: 'function',
          include: DEV_MOD_PROPERTY_TYPE_LIST
        },
        ...DEV_MOD_PROPERTY_TYPE_LIST,
      ]
    });

    if (oldDeviceFunction === null) {
      res.status(404);
      throw new Error(`DeviceFunction con id=${deviceFuntionId} non trovato.`);
    }

    if (oldDeviceFunction.device_id !== deviceId) {
      res.status(404);
      throw new Error(`DeviceFunction con id=${deviceFuntionId} non appartiene al Device con id=${deviceId}.`);
    }

    if (deviceFunction.enabled !== undefined) {
      oldDeviceFunction.enabled = deviceFunction.enabled;
    }

    for (const property_list of DEV_MOD_PROPERTY_TYPE_LIST) {
      if (deviceFunction[property_list]) {
        // update the value of every property in the deviceFunction 
        for (const property of deviceFunction[property_list]) {
          await updateDeviceFunctionProperty(res, oldDeviceFunction, property, property_list, t);
        }
      }
    }

    const updated = await oldDeviceFunction.save({ transaction: t });

    if (!updated) {
      res.status(500);
      throw new Error("Errore durante il salvataggio del DeviceFunction.");
    }
    await t.commit();
    res.send({ message: `DeviceFunction con id=${deviceFuntionId} aggiornato con successo.` });
  }
  catch (err) {
    await t.rollback();
    sendError(res, err);
  }
});




router.delete('/devices/:deviceId/functions/:dFuntionId', async function (req, res) {
  const t = await db.sequelize.transaction();
  try {
    const deviceId = parseInt(req.params.deviceId);
    const deviceFuntionId = parseInt(req.params.dFuntionId);

    const deviceFunction = await DeviceFunction.findByPk(deviceFuntionId, { transaction: t });

    if (deviceFunction === null) {
      res.status(404);
      throw new Error(`DeviceFunction con id=${deviceFuntionId} non trovato.`);
    }

    if (deviceFunction.device_id !== deviceId) {
      res.status(404);
      throw new Error(`DeviceFunction con id=${deviceFuntionId} non appartiene al Device con id=${deviceId}.`);
    }

    await deviceFunction.destroy({ transaction: t });
    await t.commit();
    res.send({ message: `DeviceFunction con id=${deviceFuntionId} eliminato con successo.` });
  }
  catch (err) {
    await t.rollback();
    sendError(res, err);
  }
});



router.post('/devices/:deviceId/functions/apply', async function (req, res) {
  const t = await db.sequelize.transaction();
  try {
    const deviceId = parseInt(req.params.deviceId);

    const device = await Device.findByPk(deviceId, { transaction: t, include: 'din' });

    if (device === null) {
      res.status(404);
      throw new Error(`Device con id=${deviceId} non trovato.`);
    }

    const deviceFunctions = await DeviceFunction.findAll({
      where: { device_id: deviceId },
      include: [
        {
          model: DeviceModelFunction,
          as: 'function',
          include: DEV_MOD_PROPERTY_TYPE_LIST,
        },
        ...DEV_MOD_PROPERTY_TYPE_LIST,
      ],
      transaction: t,
    });

    console.log(JSON.stringify(deviceFunctions, null, 2));


    const din = parseInt(device.din.din);

    let index = 0;
    for (const deviceFunction of deviceFunctions) {
      // send a DDO with the deviceFunction properties
      const deviceFunctionJSON = addPropertyTemplateToDeviceFunction(deviceFunction);

      const payload = DeviceFunctionToDDOPayload(deviceFunctionJSON, index);

      console.log(payload);

      // send the DDO to the device
      const typeset = 3700 + parseInt(deviceFunction.device_model_function_id);

      console.log(`sending DDO [to din: ${din}, typeset: ${typeset}]\n${payload}\n`);

      daas.send(din, typeset, payload);
      index += 1;
    }

    await t.commit();
    res.send({ message: `inviate regole al device con din ${din}` });
  }
  catch (err) {
    await t.rollback();
    sendError(res, err);
  }
});

function validateWithPropertyValueType(property, value) {
  switch (property.data_type) {

    // int32
    case 1:
      return isNumeric(value) && Number.isInteger(parseFloat(value));
    // int16
    case 2:
      return isNumeric(value) && Number.isInteger(parseFloat(value));
    // float32
    case 3:
      return isNumeric(value)
    // string
    case 4:
      return typeof value === 'string';
    // int8
    case 5:
      return isNumeric(value) && Number.isInteger(parseFloat(value));
    // i64
    case 6:
      return isNumeric(value) && Number.isInteger(parseFloat(value));
    // f64
    case 7:
      return isNumeric(value);
    default:
      return false;
  }

  function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

}

async function createDeviceModelFunctionProperty(res, property, deviceModelFunction, property_type, t) {
  property_type = parseInt(property_type);
  if (property_type < 1 || property_type > 4) {
    res.status(400);
    throw new Error(`Il campo property_type deve essere compreso tra 1 e 4.`);
  }

  property.property_type = property_type;
  property.function_id = deviceModelFunction.id;

  const property_list = DEV_MOD_PROPERTY_TYPE_MAP[property_type];

  if (property.name === undefined) {
    res.status(400);
    throw new Error(`Il campo name è obbligatorio per tutti i ${property_list}.`);
  }

  if (property.data_type === undefined) {
    res.status(400);
    throw new Error(`Il campo data_type è obbligatorio per tutti i ${property_list}.`);
  }

  if (property.data_type < 1 || property.data_type > 7) {
    res.status(400);
    throw new Error(`Il campo data_type deve essere compreso tra 1 e 7.`);
  }

  if (property.default_value === undefined) {
    property.default_value = DEV_MOD_DEFAULT_VALUE_MAP[property.data_type];
  }
  else if (!validateWithPropertyValueType(property, property.default_value)) {
    res.status(400);
    throw new Error(`Il campo default_value non è valido per il tipo di dato.`);
  }

  if (property.safe_value === undefined) {
    property.safe_value = property.default_value;
  }
  else if (!validateWithPropertyValueType(property, property.safe_value)) {
    res.status(400);
    throw new Error(`Il campo safe_value non è valido per il tipo di dato.`);
  }

  return await deviceModelFunction.createProperty(property, { transaction: t });
}


async function updateDeviceModelFunctionProperty(res, oldProperty, newProperty, deviceModelFunction, t) {
  if (newProperty.name !== undefined) {
    oldProperty.name = newProperty.name;
  }

  if (newProperty.property_type !== undefined) {
    res.status(400);
    throw new Error(`Il campo property_type non può essere modificato. (property_id=${oldProperty.id})`);
  }

  let changed_data_type = false
  if (newProperty.data_type !== undefined) {
    oldProperty.data_type = newProperty.data_type;
    changed_data_type = true;
  }

  if (newProperty.default_value !== undefined) {

    if (newProperty.data_type < 1 || newProperty.data_type > 7) {
      res.status(400);
      throw new Error(`Il campo data_type deve essere compreso tra 1 e 7. (property_id=${oldProperty.id})`);
    }

    if (!validateWithPropertyValueType(oldProperty, newProperty.default_value)) {
      res.status(400);
      throw new Error(`Il campo default_value non è valido per il tipo di dato. (property_id=${oldProperty.id})`);
    }
    oldProperty.default_value = newProperty.default_value;
  }
  else if (changed_data_type) {
    if (!validateWithPropertyValueType(oldProperty, oldProperty.default_value)) {
      res.status(400);
      throw new Error(`Il campo default_value non è più valido per il nuovo tipo di dato assegnato. (property_id=${oldProperty.id})`);
    }
  }

  if (newProperty.safe_value !== undefined) {
    if (!validateWithPropertyValueType(oldProperty, newProperty.safe_value)) {
      res.status(400);
      throw new Error(`Il campo safe_value non è valido per il tipo di dato. (property_id=${oldProperty.id})`);
    }
    oldProperty.safe_value = newProperty.safe_value;
  }
  else if (changed_data_type) {
    if (!validateWithPropertyValueType(oldProperty, oldProperty.safe_value)) {
      res.status(400);
      throw new Error(`Il campo safe_value non è più valido per il nuovo tipo di dato assegnato. (property_id=${oldProperty.id})`);
    }
  }

  return await oldProperty.save({ transaction: t });

}


function addPropertyTemplateToProperty(property, deviceModelFunction) {
  const propertyType = DEV_MOD_PROPERTY_TYPE_MAP[property.property_type];

  const property_template = deviceModelFunction[propertyType]?.find(property_template => property_template.id === property.property_id);
  if (property_template) {
    property.parameter_template = property_template;
  }
  return property;
}

function addPropertyTemplateToDeviceFunction(deviceFunction) {
  const deviceModelFunction = deviceFunction.function;
  const deviceFunctionJSON = deviceFunction.toJSON();
  for (const property_list of DEV_MOD_PROPERTY_TYPE_LIST) {
    deviceFunctionJSON[property_list] = deviceFunctionJSON[property_list].map(property => addPropertyTemplateToProperty(property, deviceModelFunction));
  }
  return deviceFunctionJSON;
}

async function updateDeviceFunctionProperty(res, oldDeviceFunction, property, property_list, t) {
  if (!property.id) {
    res.status(400);
    throw new Error(`Il campo id è obbligatorio per tutti i ${property_list}.`);
  }

  const oldProperty = oldDeviceFunction[property_list].find(p => p.id === property.id);

  if (oldProperty === undefined) {
    res.status(404);
    throw new Error(`Property con id=${property.id} non trovato.`);
  }

  if (property.property_id && property.property_id !== oldProperty.property_id) {
    res.status(400);
    throw new Error(`Il campo property_id non può essere modificato. (property_id=${oldProperty.id})`);
  }

  if (property.value !== undefined && property.value !== oldProperty.value) {

    const deviceModelFunction = oldDeviceFunction.function;
    const property_template = deviceModelFunction[property_list].find(property_template => property_template.id === oldProperty.property_id);

    if (property_template === undefined) {
      res.status(500);
      throw new Error(`Il template della property non trovato. (property_id=${oldProperty.id
        })`);
    }

    if (!validateWithPropertyValueType(property_template, property.value)) {
      res.status(400);
      throw new Error(`Il campo value non è valido per il tipo di dato. (property_id=${oldProperty.id})`);
    }

    oldProperty.value = property.value;
    return await oldProperty.save({ transaction: t });
  }
}


async function createDeviceModelFunction(req, res, deviceModelId, deviceModelFunction, t) {
  if (!deviceModelFunction) {
    res.status(400);
    throw new Error("Il body della richiesta è vuoto.");
  }

  if (!deviceModelFunction.name) {
    res.status(400);
    throw new Error("Il campo name è obbligatorio.");
  }

  if (deviceModelFunction.device_model_id && deviceModelFunction.device_model_id !== deviceModelId) {
    res.status(400);
    throw new Error("Il campo device_model_id non corrisponde all'id del DeviceModel.");
  }
  deviceModelFunction.device_model_id = deviceModelId;


  const deviceModel = await DeviceModel.findByPk(deviceModelId, { transaction: t });
  if (deviceModel === null) {
    res.status(404);
    throw new Error(`DeviceModel con id=${deviceModelId} non trovato.`);
  }

  const newDeviceModelFunction = await DeviceModelFunction.create(deviceModelFunction, { transaction: t });

  // per ogni tipo di property (parameters, inputs, outputs, notifications)
  for (const property_list of DEV_MOD_PROPERTY_TYPE_LIST) {
    const property_type = DEV_MOD_PROPERTY_TYPE_MAP_REVERSE[property_list];

    if (deviceModelFunction[property_list]) {
      for (const property of deviceModelFunction[property_list]) {
        await createDeviceModelFunctionProperty(res, property, newDeviceModelFunction, property_type, t);
      }
    }
  }

  // se la device model function ha una lista 'properties' la uso per creare le properties
  if (deviceModelFunction.properties) {
    for (const property of deviceModelFunction.properties) {
      if (!property.property_type) {
        res.status(400);
        throw new Error(`Il campo property_type è obbligatorio per le properties dentro la lista 'properties'.`);
      }

      await createDeviceModelFunctionProperty(res, property, newDeviceModelFunction, property.property_type, t);
    }
  }


  const deviceModelFunctionWithProperties = await DeviceModelFunction.findByPk(newDeviceModelFunction.id, {
    include: DEV_MOD_PROPERTY_TYPE_LIST,
    transaction: t,
  });

  return deviceModelFunctionWithProperties;
}


function DeviceFunctionToDDOPayload(fn, func_index) {
  const payload = {
    func_index,
    parameters: {},
    inputs: {},
    outputs: {},
    notifications: {}
  }

  for (const property_list of DEV_MOD_PROPERTY_TYPE_LIST) {
    fn[property_list].forEach(p => payload[property_list][p.parameter_template.name] = p.value);
  }

  return JSON.stringify(payload, null, 2);
}
