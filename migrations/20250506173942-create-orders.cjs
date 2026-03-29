'use strict';

module.exports = {
	async up (queryInterface, Sequelize) {
		await queryInterface.createTable("orders", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.INTEGER,
				references: {
					model: "users",
					key: "id",
				},
			},
			total_price: {
				type: Sequelize.DECIMAL(8, 2),
			},
			ordered_at: {
				type: Sequelize.DATE,
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
	async down (queryInterface) {
		await queryInterface.dropTable("orders");
	}
};