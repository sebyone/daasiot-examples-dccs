'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('device_model', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Unknown',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('device_model', 'name');
  }
};
