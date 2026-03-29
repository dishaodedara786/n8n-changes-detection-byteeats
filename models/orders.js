"use strict";

import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
	class Order extends Model {
		static associate(models) {
			Order.hasMany(models.OrderItem, {
				foreignKey: "order_id",
			});
			Order.belongsTo(models.User, {
				foreignKey: "user_id",
			});
		}
	}
	Order.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			user_id: {
				type: DataTypes.INTEGER,
				references: {
					model: "users",
					key: "id",
				},
			},
			ordered_at: {
				type: DataTypes.DATE,
			},
			total_price: {
				type: DataTypes.DECIMAL(8, 2),
			},
			deleted_at: {
				type: DataTypes.DATE,
				allowNull: true,
				defaultValue: null,
			},
			created_at: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			updated_at: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			modelName: "Order",
			tableName: "orders",
			createdAt: "created_at",
			updatedAt: "updated_at",
			deletedAt: "deleted_at",
		}
	);

	return Order;
};