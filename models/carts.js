'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
	class Cart extends Model {
		static associate(models) {
			Cart.belongsTo(models.User, {
				foreignKey: "user_id",
				onDelete: "CASCADE",
			});
			Cart.belongsTo(models.FoodItem, {
				foreignKey: "food_item_id",
				onDelete: "CASCADE",
			});
		}
	}

	Cart.init(
		{
			id: {
				type: DataTypes.BIGINT,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			user_id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
			},
			food_item_id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				references: {
					model: "food_items",
					key: "id",
				},
			},
			quantity: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			price: {
				type: DataTypes.DECIMAL(8, 2),
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
			modelName: "Cart",
			tableName: "carts",
			createdAt: "created_at",
			updatedAt: "updated_at",
		}
	);

	return Cart;
};