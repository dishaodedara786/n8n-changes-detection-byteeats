"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
	async up(queryInterface) {
		const hashedPassword = await bcrypt.hash("Disha@1234", 10);

		return queryInterface.bulkInsert("users", [{
			name: "ByteEats Admin",
			email: "disha@krishaweb.com",
			phone: "1234567890",
			password: hashedPassword,
			role: "admin",
			avatar: "1742882763247.jpg",
			created_at: new Date(),
			updated_at: new Date(),
		}]);
	},

	async down(queryInterface) {
		return queryInterface.bulkDelete("users", { email:"disha@krishaweb.com" });
	},
};