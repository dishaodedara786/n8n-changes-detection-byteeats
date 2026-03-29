"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("order_items", {
			id: {
				type: Sequelize.BIGINT,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			order_id: {
				type: Sequelize.BIGINT,
				allowNull: false,
				references: {
					model: "orders",
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
			total_amount: {
				type: Sequelize.DECIMAL(8, 2),
			},
			deleted_at: {
				type: Sequelize.DATE,
				allowNull: true,
				defaultValue: null,
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
		await queryInterface.dropTable("order_items");
	},
};