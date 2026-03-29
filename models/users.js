"use strict";

import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
			User.hasMany(models.Order, {
				foreignKey: "user_id",
			});
			User.hasMany(models.Wishlist, {
				foreignKey: "user_id",
			});
			User.hasMany(models.Cart, {
				foreignKey: "user_id",
			});
		}
	}
	User.init(
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
			email: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			phone: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			avatar: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			role: {
				type: DataTypes.ENUM("user", "admin"),
				allowNull: false,
				defaultValue: "user",
			},
			email_verified_at: {
				type: DataTypes.DATE,
				allowNull: true,
				defaultValue: null,
			},
			reset_password_token: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			reset_password_expires: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			google_id: {
				type: DataTypes.STRING,
				allowNull: true,
				unique: true,
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
			modelName: "User",
			tableName: "users",
			createdAt: "created_at",
			updatedAt: "updated_at",
			deletedAt: "deleted_at", 
		}
	);

	return User;
};