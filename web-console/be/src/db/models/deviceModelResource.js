'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeviceModelResource extends Model {
    static associate(models) {
      this.belongsTo(models.DeviceModel, { foreignKey: 'device_model_id', as: 'device_model' });
    }
  }
  DeviceModelResource.init({
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isUrl: true,
      }
    },
    /**
      1: altro
      2: scheda tecnica
      3: scheda utente
      4: immagine
      5: binario
     */
    resource_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[1, 2, 3, 4, 5]],
      },
    },
    device_model_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'DeviceModelResource',
    tableName: 'device_model_resource',
    underscored: true,
    timestamps: true,
  });
  return DeviceModelResource;
};
