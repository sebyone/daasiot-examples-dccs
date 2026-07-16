'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('device', {
      fields: ['din_id'],
      type: 'unique',
      name: 'unique_device_din_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('device', 'unique_device_din_id');
  }
};
