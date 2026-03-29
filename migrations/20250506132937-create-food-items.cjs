'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("food_items", {
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
			category_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "categories",
					key: "id",
				},
			},
			price: {
				type: Sequelize.DECIMAL(8, 2),
			},
			image: {
				type: Sequelize.STRING,
			},
			stock: {
				type: Sequelize.BIGINT,
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
		await queryInterface.dropTable('food_items');
	}
};