import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import db from "../../models/index.js";
import sendOTPEmail from "../../services/mailService.js";
import logger from "../../config/logger.js";
import signupValidation from "../../validations/signupValidation.js";
import updateProfileValidation from "../../validations/updateProfileValidation.js";
// import changePasswordValidation from "../../validations/changePasswordValidation.js";

const User = db.User;

// const foodItem = db.FoodItem;
// const Category = db.Category;

export async function index(req, res) {
	try {
		const users = await User.findAll({
			where: { 
				deleted_at: { [Op.is]: null }, 
				role: "user" 
			},
		});

		return res.render("admin/users/index", {
			users,
			success_msg: req.session.success_msg,
			error_msg: req.session.error_msg,
		});

		// req.session.success_msg = null;
		// req.session.error_msg = null;
	} catch (err) {
		logger.error(`Failed to fetch users: ${err}`);

		return res
			.status(500)
			.send("An internal server error occurred. Please try again later.");
	}
};

export async function create(req, res) {
	const success_msg = req.session.success_msg;
	const error_msg = req.session.error_msg;
	req.session.success_msg = null;
	req.session.error_msg = null;
	const errors = {};

	return res.render("admin/users/create", { errors, success_msg, error_msg });
}

export async function store(req, res) {
	try {
		const {
			name,
			email,
			phone,
			password,
			confirmPassword,
			role = "user",
		} = req.body;
		
		const avatar = req.file ? `${req.file.filename}` : "default.png";

		const { error } = signupValidation.validate(req.body,{abortEarly:false})

		let errors = {};
		if (error) {
			errors = error.details.reduce((acc, err) => {
				acc[err.context.key] = err.message;
				return acc;
			}, {});
		}

		if (!errors) {
			const existingUser = await User.findOne({
				where: {
					[Op.or]: [{ email: email }, { phone: phone }],
				},
			});
		
			if (existingUser) {
				if (existingUser.email === email) {
					errors.email = "Email is already taken.";
				}
				if (existingUser.phone === phone) {
					errors.phone = "Phone number is already taken.";
				}
			}
			if (password !== confirmPassword) {
				errors.password = "Passwords do not match.";
			}
		}

		if (Object.keys(errors).length > 0) {
			return res.render("admin/users/create", {
				errors,
				name,
				email,
				phone,
				avatar,
				password,
				role,
			});
		}
		const hashedPassword = await bcrypt.hash(password, 10);

		const userData = {
			name,
			email,
			phone,
			password: hashedPassword,
			role,
			avatar,
			created_at: new Date(),
			updated_at: new Date(),
		};

		req.session.name = name;
		req.session.email = email;
		req.session.phone = phone;
		req.session.avatar = avatar;

		await User.create(userData);

		await sendOTPEmail(
			email,
			"ByteEats - Your Account Has Been Created",
			`<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
			<h2 style="color: #e67e22;">Welcome to ByteEats!</h2>
			<p>
			Your account has been successfully created. Here are your login details:
			</p>
			<ul>
			<li><strong>Username:</strong> ${email}</li>
			<li><strong>Password:</strong> ${password}</li>
			</ul>
			<p>
			Please keep these credentials safe and do not share them with anyone.
			</p>
			<p>
			Thank you for joining us,<br/>
			<strong>The ByteEats Team</strong>
			</p>
			</div>
		`);

		req.session.success_msg = "User created successfully.";

		return res.redirect("/admin/users");
	} catch (err) {
		logger.error(`Error while creating(by admin) a user: ${err}`);

		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";

		return res.redirect("/admin/create/user");
	}
};

export async function show(req, res) {
	const user = await User.findOne({ where: { id: req.params.id } });

	if (!user) {
		return res.redirect("/admin/users");
	}

	return res.render("admin/users/show", { user });
}

export async function edit(req, res) {
	const user = await User.findOne({ where: { id: req.params.id } });

	if (!user) {
		return res.redirect("/admin/users");
	}

	const success_msg = req.session.success_msg;
	const error_msg = req.session.error_msg;
	req.session.success_msg = null;
	req.session.error_msg = null;
	const errors = {};

	return res.render("admin/users/edit", {
		user,
		errors,
		success_msg,
		error_msg,
	});
}

export async function update(req, res) {
	try {
		const { name, email, phone, role } = req.body;
		const { error } = updateProfileValidation.validate(req.body);
		let errors = {};

		if (error) {
			errors = error.details.reduce((acc, err) => {
				acc[err.context.key] = err.message;
				return acc;
			}, {});
		}

		if (!req.params.id) {
			req.session.error_msg = "User not found.";
			// res.render("/admin/users");

			return res.status(404).render("errors/404", { message: "Page not found." });
		}

		const user = await User.findOne({ where: { id: req.params.id } });

		if (!user) {
			req.session.error_msg = "User not found.";

			return res.status(404).render("errors/404", { message: "Page not found." });
			// return res.render("/admin/users");
		}

		if (user.email !== email) {
			const emailExists = await User.findOne({
				where: { email, id: { [Op.ne]: user.id } },
			});

			if (emailExists) {
				errors.email = "Email is already taken.";
			}
		}

		if (user.phone !== phone) {
			const phoneExists = await User.findOne({
				where: { phone, id: { [Op.ne]: user.id } },
			});
			if (phoneExists) {
				errors.phone = "Phone number is already taken.";
			}
		}

		if (Object.keys(errors).length > 0) {
			return res.render("admin/users/edit", {
				errors,
				user: {
					...user.toJSON(),
					name,
					email,
					phone,
					role,
				},
			});
		}

		user.name = name;
		user.email = email;
		user.phone = phone;
		user.role = role;

		if (req.file) {
			user.avatar = req.file.filename;
		}

		await user.save();

		req.session.success_msg = "Profile updated successfully.";

		return res.redirect("/admin/users");
	} catch (err) {
		logger.error(`Error while updating(by admin) a user: ${err}`);

		return res.status(500).render("500", {
      		message: "An internal server error occurred. Please try again later.",
    	});
	}
};

export async function destroy(req, res) {
	try {
		const { id } = req.params;
		const user = await User.findByPk(id);

		if (!user) {
			req.session.error_msg = "User not found.";

			return res.redirect("/admin/users");
		}

		user.deleted_at = new Date();
		await user.save();

		req.session.success_msg = "User deleted successfully";

		return res.redirect("/admin/users");
	} catch (err) {
		logger.error(`Error while deleting(by admin) a user: ${err}`);
		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";

		return res.redirect("/admin/users");
	}
};