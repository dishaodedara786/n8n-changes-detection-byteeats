import db from "../../models/index.js";
import logger from "../../config/logger.js";

const Category = db.Category;

export async function index(req, res) {
	try {
		const categories = await Category.findAll({
			where: { deleted_at: null },
		});

		const success_msg = req.session.success_msg;
		const error_msg = req.session.error_msg;
		req.session.success_msg = null;
		req.session.error_msg = null;

		return res.render("admin/categories/index", {
			categories,
			success_msg,
			error_msg,
		});
	} catch (err) {
		logger.error(`Failed to fetch categories: ${err}`);
		req.session.error_msg = "An error occurred while loading the categories. Please try again later.";

		return res.redirect("/admin");
	}
}

export async function create(req, res) {
	try {
		const success_msg = req.session.success_msg;
		const error_msg = req.session.error_msg;
		req.session.success_msg = null;
		req.session.error_msg = null;
		const errors = {};

		return res.render("admin/categories/create", {
			errors,
			success_msg,
			error_msg,
		});
	} catch (err) {
		logger.error(`Error while rendering category create page: ${err}`);

		return res
			.render("errors/500", { message: "An internal server error occurred. Please try again later." });
	}
}

export async function store(req, res) {
	try {
		let errors = {}
		const { id, name } = req.body;

		if (!name || name.trim() === "") {
			errors.name = "Category name is required.";

			return res.render('admin/categories/create', { errors });
		}

		await Category.create({
			id,
			name,
		});
		req.session.success_msg = "Category created successfully.";

		return res.redirect("/admin/categories");
	} catch (err) {
		logger.error(`Error while creating category: ${err}`);
		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";

		return res.redirect("/admin/categories");
	}
};

export async function show(req, res) {
	try {
		const id = req.params.id;
		const category = await Category.findOne({ where: { id } });

		if (!category) {
			req.session.error_msg = "Category not found.";

			return res.redirect("/admin/categories");
		}

		const success_msg = req.session.success_msg;
		const error_msg = req.session.error_msg;
		req.session.success_msg = null;
		req.session.error_msg = null;
		const errors = {};

		return res.render("admin/categories/show", {
			category,
			errors,
			success_msg,
			error_msg,
		});
	} catch (err) {
		logger.error(`Error while showing category: ${err}`);
		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";
		
		return res.redirect("/admin/categories");
	}
}

export async function edit(req, res) {
	try {
		const id = req.params.id;
		const category = await Category.findOne({ where: { id } });

		if (!category) {
			req.session.error_msg = "Category not found.";

			return res.redirect("/admin/categories");
		}

		const success_msg = req.session.success_msg;
		const error_msg = req.session.error_msg;
		req.session.success_msg = null;
		req.session.error_msg = null;
		const errors = {};

		return res.render("admin/categories/edit", {
			category,
			errors,
			success_msg,
			error_msg,
		});
	} catch (err) {
		logger.error(`Error while rendering category edit page: ${err}`);
		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";
		
		return res.redirect("/admin/categories");
	}
}

export async function update(req, res) {
	try {
		const id = req.params.id;
		const { name } = req.body;

		if (!name || name.trim() === "") {
			req.session.error_msg = "Category name cannot be empty.";

			return res.redirect(`/admin/edit/category/${id}`);
		}

		const category = await Category.findOne({ where: { id } });

		if (!category) {
			req.session.error_msg = "Category not found.";

			return res.redirect("/admin/categories");
		}

		category.name = name.trim();
		await category.save();

		req.session.success_msg = "Category updated successfully.";

		return res.redirect("/admin/categories");
	} catch (err) {
		logger.error(`Error while updating category: ${err}`);
		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";

		return res.redirect(`/admin/edit/category/${id}`);
	}
};

export async function destroy(req, res) {
	try {
		const id = req.params.id;

		const category = await Category.findOne({ where: { id, deleted_at: null } });
		if (!category) {
			req.session.error_msg = "Category not found.";

			return res.redirect("/admin/categories");
		}

		category.deleted_at = new Date();
		await category.save();

		req.session.success_msg = "Category deleted successfully.";

		return res.redirect("/admin/categories");
	} catch (err) {
		logger.error(`Error while deleting category: ${err}`);
		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";

		return res.redirect("/admin/categories");
	}
};