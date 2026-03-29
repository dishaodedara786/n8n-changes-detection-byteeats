"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("users", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			phone: {
				type: Sequelize.BIGINT,
				allowNull: false,
				unique: true,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			avatar: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			role: {
				type: Sequelize.ENUM("user", "admin"),
				allowNull: false,
				defaultValue: "user",
			},
			email_verified_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			reset_password_token: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			reset_password_expires: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			google_id: {
				type: Sequelize.STRING,
				allowNull: true,
				unique: true,
			},
			deleted_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable("users");
	},
};