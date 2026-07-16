'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {


    /*
    PID1
  La funzione di regolazione PID1 prevede un ingresso, quattro parametri e due uscite:
  
    parametri: P, I, D, Frequenza, Timeout
  ingresso: numero target ( obiettivo: 1..1024)
    ingresso: numero corrente ( rilevato: 1..1024 )
    uscita: numero  pilota ( pilota: 1..1024 )
  
    notifiche: eventi di regolazione (ogni qualvolta viene eseguita la funzione)
    allarmi: incongruenze ingressi uscite, mancanza di reazione,  
  
  PLN1
  La funzione di regolazione PLN1 (plan) non richiede ingressi, prevede una lista di parametri, e prevede una sola uscita:
  
    parametri: <#ix>,<week-day>,<time>,<pilota:N16>
    uscita: numero pilota ( pilota: 1..1024 )
    */

    await queryInterface.bulkInsert('device_model_function', [
      {
        id: 1,
        name: 'switch',
        device_model_id: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'PID1',
        device_model_id: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: 'PLN1',
        device_model_id: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        id: 4,
        name: 'PLN1',
        device_model_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        id: 5,
        name: 'PID1',
        device_model_id: 3,
        created_at: new Date(),
        updated_at: new Date(),
      }

    ], {});

    await queryInterface.bulkInsert('device_model_function_property', [
      {
        id: 1,
        property_type: 1,
        name: 'mode',
        function_id: 1,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 2,
        property_type: 1,
        name: 'delay',
        function_id: 1,
        data_type: 3,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 3,
        property_type: 2,
        name: 'trigger',
        function_id: 1,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },


      {
        id: 4,
        property_type: 1,
        name: 'P',
        function_id: 2,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 5,
        property_type: 1,
        name: 'I',
        function_id: 2,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 6,
        property_type: 1,
        name: 'D',
        function_id: 2,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 7,
        property_type: 1,
        name: 'Frequenza',
        function_id: 2,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 8,
        property_type: 1,
        name: 'Timeout',
        function_id: 2,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 9,
        property_type: 2,
        name: 'target',
        function_id: 2,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 10,
        property_type: 2,
        name: 'corrente',
        function_id: 2,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 11,
        property_type: 3,
        name: 'pilota',
        function_id: 2,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },


      {
        id: 12,
        property_type: 1,
        name: 'ix',
        function_id: 3,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 13,
        property_type: 1,
        name: 'week-day',
        function_id: 3,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 14,
        property_type: 1,
        name: 'time',
        function_id: 3,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 15,
        property_type: 1,
        name: 'pilota',
        function_id: 3,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 28,
        property_type: 3,
        name: 'pilota',
        function_id: 3,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },


      {
        id: 16,
        property_type: 1,
        name: 'ix',
        function_id: 4,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 17,
        property_type: 1,
        name: 'week-day',
        function_id: 4,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 18,
        property_type: 1,
        name: 'time',
        function_id: 4,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 19,
        property_type: 1,
        name: 'pilota',
        function_id: 4,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },


      {
        id: 20,
        property_type: 1,
        name: 'P',
        function_id: 5,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 21,
        property_type: 1,
        name: 'I',
        function_id: 5,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 22,
        property_type: 1,
        name: 'D',
        function_id: 5,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 23,
        property_type: 1,
        name: 'Frequenza',
        function_id: 5,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 24,
        property_type: 1,
        name: 'Timeout',
        function_id: 5,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 25,
        property_type: 2,
        name: 'target',
        function_id: 5,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 26,
        property_type: 2,
        name: 'corrente',
        function_id: 5,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },
      {
        id: 27,
        property_type: 3,
        name: 'pilota',
        function_id: 5,
        data_type: 1,
        default_value: '1',
        safe_value: '1',
      },

      // id: 28 was already defined

    ], {});
  },


  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('device_model_function_property', null, {});
    await queryInterface.bulkDelete('device_model_function', null, {});
  }
};
