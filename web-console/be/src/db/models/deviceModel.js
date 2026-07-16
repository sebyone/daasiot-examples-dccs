'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class DeviceModel extends Model {
		static associate(models) {
			this.belongsTo(models.DeviceModelGroup, { foreignKey: 'device_group_id', as: 'device_group' });
			this.hasMany(models.Device, { foreignKey: 'device_model_id', onDelete: 'CASCADE', as: 'devices' });
			this.hasMany(models.DeviceModelFunction, { foreignKey: 'device_model_id', onDelete: 'CASCADE', as: 'functions' });
			this.hasMany(models.DeviceModelResource, { foreignKey: 'device_model_id', onDelete: 'CASCADE', as: 'resources' });
		}
	}
	DeviceModel.init({
		device_group_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		sequelize,
		modelName: 'DeviceModel',
		tableName: 'device_model',
		timestamps: true,
		underscored: true,
	});
	return DeviceModel;
};

