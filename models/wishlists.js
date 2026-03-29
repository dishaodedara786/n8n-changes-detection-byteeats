'use strict';

import { Model } from "sequelize";

export default  (sequelize, DataTypes) => {
	class Wishlist extends Model {
		static associate(models) {
			Wishlist.belongsTo(models.User, {
				foreignKey: "user_id",
			});
			Wishlist.belongsTo(models.FoodItem, {
				foreignKey: "food_item_id",
			});
		}
	}
	Wishlist.init(
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
			modelName: "Wishlist",
			tableName: "wishlists",
			createdAt: "created_at",
			updatedAt: "updated_at",
		}
	);

	return Wishlist;
};