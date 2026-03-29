import db from "../models/index.js";

const User = db.User;

async function isAuth(req, res, next) {
	if (req.session.isAuth) {
		next();
	} else {
		res.redirect("/home");
	}
}

async function checkUserAuth(req, res, next) {
	const user = await User.findOne({ where: { id: req.session.userId } });

	if (req.session.isAuth && user.role === "user") {
		next();
	} else {
		res.redirect("/admin/dashboard");
	}
}

async function checkAdminAuth(req, res, next) {
	
	const user = await User.findOne({ where: { id: req.session.userId } });

	if (req.session.isAuth && user.role === "admin") {
		next();
	} else {
		res.redirect("/dashboard");
	}
}

export { isAuth, checkUserAuth, checkAdminAuth };