"use strict";

import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
	class FoodItem extends Model {	
		static associate(models) {
			FoodItem.belongsTo(models.Category, { 
				foreignKey: "category_id",
			});
			FoodItem.hasMany(models.OrderItem, {
				foreignKey: "food_item_id",
			});
			FoodItem.hasMany(models.Wishlist, {
				foreignKey: "food_item_id",
			});
			FoodItem.hasMany(models.Cart, {
				foreignKey: "food_item_id",
			});
		}
	}
	FoodItem.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			category_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "categories",
					key: "id",
				},
			},
			price: {
				type: DataTypes.DECIMAL,
			},
			image: {
				type: DataTypes.STRING,
			},
			stock: {
				type: DataTypes.BIGINT,
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
			modelName: "FoodItem",
			tableName: "food_items",
			createdAt: "created_at",
			updatedAt: "updated_at",
			deletedAt: "deleted_at",
		}
	);

	return FoodItem;
};