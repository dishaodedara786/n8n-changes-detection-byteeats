import db from "../../models/index.js";

const User = db.User;
const foodItem = db.FoodItem;

export async function isAuth(req, res) {
  	if (!req.session.isAuth) {
    	return res.redirect("/home");
  	}

  	next();
};

export async function index(req, res) {
	const success_msg = req.session.success_msg;
	const error_msg = req.session.error_msg;
	req.session.success_msg = null;
	req.session.error_msg = null;
	const userId = req.session.userId;

	const user = await User.findByPk(userId);

	const foodItems = await foodItem.findAll({
		include: [{ model: db.categories, attributes: ["name"] }],
	});

	return res.render("portal/dashboard", { user, error_msg, success_msg, foodItems });
};