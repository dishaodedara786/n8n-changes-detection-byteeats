import logger from "../../config/logger.js";

export async function index(req, res) {
	try {
		return res.render("admin/dashboard", {
			success_msg: req.session.success_msg,
			error_msg: req.session.error_msg,
		});

	} catch (err) {
		logger.error(err);

		return res
			.status(500)
			.send("An internal server error occurred. Please try again later.");
	}
};

export async function getFoodItems(req, res) {
	try {
		return res.render("admin/food-items/index");
	} catch (err) {
		logger.error(err);

		return res
			.status(500)
			.send("An internal server error occurred. Please try again later.");
	}
};