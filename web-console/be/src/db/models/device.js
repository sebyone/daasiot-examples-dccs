'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    static associate(models) {
      this.belongsTo(models.DeviceModel, { foreignKey: 'device_model_id', as: 'device_model', onDelete: 'CASCADE' });
      this.belongsTo(models.Din, { foreignKey: 'din_id', as: 'din', onDelete: 'CASCADE' });
      this.hasMany(models.DeviceFunction, { foreignKey: 'device_id', sourceKey: 'id', as: 'functions' });
    }
  }
  Device.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    device_model_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    din_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    serial: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      validate: {
        min: -90,
        max: 90,
      },
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      validate: {
        min: -180,
        max: 180,
      },
    },
  }, {
    sequelize,
    modelName: 'Device',
    tableName: 'device',
    timestamps: true,
    underscored: true,
  });
  return Device;
};
