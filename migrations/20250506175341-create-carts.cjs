"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("carts", {
			id: {
				type: Sequelize.BIGINT,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.BIGINT,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			food_item_id: {
				type: Sequelize.BIGINT,
				allowNull: false,
				references: {
					model: "food_items",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			quantity: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},
			price: {
				type: Sequelize.DECIMAL(8, 2),
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
		await queryInterface.dropTable("carts");
	},
};