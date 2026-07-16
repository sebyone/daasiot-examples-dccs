'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeviceModelFunctionProperty extends Model {
    static associate(models) {
      this.belongsTo(models.DeviceModelFunction, { foreignKey: 'function_id', as: 'function', onDelete: 'CASCADE' });
    }
  }
  DeviceModelFunctionProperty.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    property_type: {
      type: DataTypes.INTEGER,
      validate: {
        isIn: [[1, 2, 3, 4]],
      },
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    function_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'device_model_function',
        key: 'id'
      }
    },
    data_type: {
      type: DataTypes.INTEGER,
      validate: {
        isIn: [[1, 2, 3, 4, 5, 6, 7]],
      },
      allowNull: false
    },
    default_value: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    safe_value: {
      type: DataTypes.STRING(45),
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'DeviceModelFunctionProperty',
    tableName: 'device_model_function_property',
    underscored: true,
    timestamps: false
  });

  return DeviceModelFunctionProperty;
};
