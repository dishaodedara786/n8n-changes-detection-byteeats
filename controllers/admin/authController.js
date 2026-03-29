import bcrypt from "bcryptjs";
import logger from "../../config/logger.js";
import db from "../../models/index.js";

const User = db.User;

export async function showLoginForm(req, res) {
	try {
		if (!req.session.isAuth) {
			const success_msg = req.session.success_msg;
			const error_msg = req.session.error_msg;
			req.session.success_msg = null;
			req.session.error_msg = null;

			return res.render("admin/auth/login", { success_msg, error_msg });
		} else {
			return res.render("errors/404", { message: "Page not found." });
		}
	} catch(err) {
		logger.error(`Error while rendering login page: ${err}`);

		return res
			.render("errors/500", { message: "An internal server error occurred. Please try again later." });
	}  
}

export async function login(req, res) {
	try {
		const { identifier, password } = req.body;

		if (!identifier || !password) {
			req.session.error_msg =
				"Email/phone and password are required to log in.";

			return res.redirect("/admin/login");
		}

		const user = await User.findOne({
			where: {
				[identifier.includes("@") ? "email" : "phone"]: identifier,
			},
		});

		if (!user || user.role !== "admin" || !(await bcrypt.compare(password, user.password))) {
			req.session.error_msg = "Invalid login credentials.";

			return res.redirect("/admin/login");
		}

		req.session.isAuth = true;
		req.session.userId = user.id;
		req.session.save((err) => {
			if (err) {
				logger.error("Session save error:", err);

				return res
					.render("500", { message: "An internal server error occurred. Please try again later." });
			}
			req.session.success_msg = "Admin logged in successfully.";

			return res.redirect("/admin/dashboard");
		});
	} catch (err) {
		logger.error(`Admin login error: ${err}`);

		return res
			.render("500", { message: "An internal server error occurred. Please try again later." });
	}
};