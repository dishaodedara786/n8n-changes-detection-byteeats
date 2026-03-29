"use strict";

import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
	class EmailVerification extends Model {
		//
	}
	EmailVerification.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
			},
			otp: {
				type: DataTypes.BIGINT,
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
			modelName: "EmailVerification",
			tableName: "email_verifications",
			createdAt: "created_at",
			updatedAt: "updated_at",
		}
	);

	return EmailVerification;
};