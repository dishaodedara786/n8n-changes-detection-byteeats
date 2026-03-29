import db from "../../models/index.js";
// import { Op } from "sequelize";
import logger from "../../config/logger.js";
import foodValidation from "../../validations/foodValidation.js";

const foodItem = db.FoodItem;
const Category = db.Category;

export async function index(req, res) {
	try{
		const foodItems = await db.FoodItem.findAll({
		where: { deleted_at: null },
		include: [{ model: db.Category, attributes: ["name"] }],
	});
	const success_msg = req.session.success_msg;
	const error_msg = req.session.error_msg;

	req.session.success_msg = null;
	req.session.error_msg = null;

	return res.render("admin/food-items/index", {
		fooditems: foodItems, 
		success_msg,
		error_msg,
	});
	}catch(err){
	logger.error(`Error while showing food-item: ${err}`);

		return res.render("errors/500", {
      		message: "An internal server error occurred. Please try again later.",
    	});
	}
	
}

export async function create(req, res) {
	const categories = await db.Category.findAll();

	return res.render("admin/food-items/create", {
		errors: {},
		categories,
		name: "",
		price: "",
		stock: "",
		category_id: "",
		image: "default-food.png",
		success_msg: req.session.success_msg || null,
		error_msg: req.session.error_msg || null,
	});

	// req.session.success_msg = null;
	// req.session.error_msg = null;
}

export async function store(req, res) {
	try {
		const { name, category_id, price, stock } = req.body;
		const image = req.file ? `${req.file.filename}` : "default-food.png";

		const { error } = foodValidation.validate(req.body,{abortEarly:false});
		let errors = {};
		if (error) {
			errors = error.details.reduce((acc, err) => {
				const key = err.path[0]; 
				acc[key] = err.message;
				return acc;
			}, {});
		}
		
		if (!error) {
			const category = await db.Category.findByPk(category_id);
			if (!category) {
				errors.category_id = "Selected category does not exist.";
			}
		}

		if (Object.keys(errors).length > 0) {
			return res.render("admin/food-items/create", {
				categories: await db.Category.findAll(),
				errors,
				name,
				category_id,
				price,
				stock,
				image,
				success_msg: null,
				error_msg: null
			});
		}

		await db.FoodItem.create({
			name,
			category_id,
			price,
			stock,
			image,
			created_at: new Date(),
			updated_at: new Date(),
		});

		req.session.success_msg = "Food item created successfully.";
		
		return res.redirect("/admin/food-items");
	} catch (err) {
		logger.error(`Error while creating food item: ${err}`);
		
		req.session.error_msg =
			"An internal server error occurred. Please try again later.";

		return res.redirect("/admin/create/food-items");
	}
};

export async function show(req, res) {
	try {
		const foodItem = await db.FoodItem.findByPk(req.params.id);

		const categories = await db.Category.findAll();
		const categoryMap = {};
		categories.forEach((cat) => {
			categoryMap[cat.id] = cat.name;
		});

		return res.render("admin/food-items/show", { fooditem: foodItem, categoryMap });
	} catch (err) {
		logger.error(`Error while showing food-item: ${err}`);

		return res.render("errors/500", {
      		message: "An internal server error occurred. Please try again later.",
    	});
	}
}

export async function edit(req, res) {
	const foodItem = await db.FoodItem.findOne({ where: { id: req.params.id } });
	if (!foodItem) {
		return res.redirect("/admin/food-items");
	}

	const success_msg = req.session.success_msg;
	const error_msg = req.session.error_msg;
	req.session.success_msg = null;
	req.session.error_msg = null;
	const errors = {};

	const categories = await db.Category.findAll();

	return res.render("admin/food-items/edit", {
		fooditem: foodItem,
		errors,
		success_msg,
		error_msg,
		categories,
	});
}

export async function update(req, res) {
	try {
		const { name, category_id, price, stock } = req.body;
		const { id } = req.params;

		const { error } = foodValidation.validate(req.body);
		let errors = {};

		if (error) {
			errors = error.details.reduce((acc, err) => {
				acc[err.context.key] = err.message;
				return acc;
			}, {});
		}

		const category = await db.Category.findByPk(category_id);
		if (!category) {
			errors.category_id = "Selected category does not exist.";
		}

		const food = await db.FoodItem.findByPk(id);
		if (!food) {
			req.session.error_msg = "Food item not found.";

			return res.redirect("/admin/food-items");
		}

		if (Object.keys(errors).length > 0) {
			const categories = await db.Category.findAll();

			return res.render("admin/food-items/edit", {
				fooditem: {
					...food.toJSON(),
					name,
					category_id,
					price,
					stock,
				},
				categories,
				errors,
				success_msg: null,
				error_msg: null,
			});
		}

		food.name = name;
		food.category_id = category_id;
		food.price = price;
		food.stock = stock;
		if (req.file) {
			food.image = req.file.filename;
		}

		await food.save();

		req.session.success_msg = "Food item updated successfully.";

		return res.redirect("/admin/food-items");
	} catch (err) {
		logger.error(`Error while updating food item: ${err}`);

		req.session.error_msg =
			"An internal server error occurred. Please try again later.";

		return res.redirect("/admin/food-items");
	}
};

export async function destroy(req, res) {
	try {
		const { id } = req.params;
		const food = await db.FoodItem.findByPk(id);

		if (!food) {
			req.session.error_msg = "Food item not found.";

			return res.redirect("/admin/food-items");
		}

		food.deleted_at = new Date(); 
		await food.save();

		req.session.success_msg = "Food item deleted successfully.";

		return res.redirect("/admin/food-items");
	} catch (err) {
		logger.error(`Error while deleting food item: ${err}`);

		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";

		return res.redirect("/admin/food-items");
	}
};