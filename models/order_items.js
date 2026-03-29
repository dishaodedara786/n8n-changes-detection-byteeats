"use strict";

import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
	class OrderItem extends Model {
		static associate(models) {
			OrderItem.belongsTo(models.Order, {
				foreignKey: "order_id",
			});
			OrderItem.belongsTo(models.FoodItem, {
				foreignKey: "food_item_id",
			});
		}
	}
	OrderItem.init(
		{
			id: {
				type: DataTypes.BIGINT,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			order_id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				references: {
					model: "orders",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			food_item_id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				references: {
					model: "food_items",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			quantity: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			total_amount: {
				type: DataTypes.DECIMAL(8, 2),
			},
			deleted_at: {
				type: DataTypes.DATE,
				allowNull: true,
				defaultValue: null,
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			updated_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			modelName: "OrderItem",
			tableName: "order_items",
			createdAt: "created_at",
			updatedAt: "updated_at",
			deletedAt: "deleted_at",
		}
	);

	return OrderItem;
};