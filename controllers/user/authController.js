import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "../../models/index.js";
import logger from "../../config/logger.js";
import config from "../../config/app.js";
import sendOTPEmail from "../../services/mailService.js";
import sendSms from "../../services/sendSmsService.js";
import verifyEmail from "../../services/verifyEmailLinkService.js";
import signupValidation from "../../validations/signupValidation.js";
import PasswordValidation from "../../validations/PasswordValidation.js";
import updateProfileValidation from "../../validations/updateProfileValidation.js";
import changePasswordValidation from "../../validations/changePasswordValidation.js";

const User = db.User;
const verify = db.EmailVerification;
const foodItem = db.FoodItem;
const Category = db.Category;

export async function showRegistrationForm(req, res) {
	try {
		if (!req.session.isAuth) {
			const error_msg = req.session.error_msg;
			const success_msg = req.session.success_msg;
			delete req.session.error_msg;
			delete req.session.success_msg;

			return res.render("portal/auth/register", {
				errors: {},
				username: "",
				name: "",
				email: "",
				phone: "",
				avatar: "default.png",
				error_msg,
				success_msg,
			});
		} else {
			return res.status(404).render("errors/404", { message: "Page not found." });
		}
	} catch (err) {
		logger.error(`Error rendering register page: ${err}`);

		return res.status(500).send("An internal server error occurred. Please try again later.");
	}
};

export async function register(req, res) {
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

		const { error } = signupValidation.validate(req.body,{abortEarly:false});

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
			return res.render("portal/auth/register", {
				errors,
				name,
				email,
				phone,
				avatar,
				password,
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

		await User.create(userData);

		req.session.name = name;
		req.session.email = email;
		req.session.phone = phone;
		req.session.avatar = avatar;

		await verifyEmail(email);

		req.session.success_msg =
			"Your registration was successful! Please check your email to verify your account and start enjoying ByteEats.";

		delete req.session.name;
		delete req.session.email;
		delete req.session.phone;
		delete req.session.avatar;

		return res.redirect("/login");
	} catch (err) {
		logger.error(`Error while registering a user: ${err}`);

		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";

		return res.redirect("/register");
	}
};

export async function verifyUser(req, res) {
	try {
		const { email, token } = req.query;
		const isVerified = await verify.findOne({ where: { email, otp: token } });

		if (!isVerified) {
			return res.render("error", {
				message:
				"The verification link is invalid or has expired. Please check the link or request a new one.",
			});
		}

		const expiryDuration = 24 * 60 * 60 * 1000;

		if (Date.now() - isVerified.created_at.getTime() > expiryDuration) {
			await verify.destroy({ where: { email } });

			req.session.email = email;

			const link = `${config.app.url}/verifyEmail`;
			req.session.success_msg = 
				`The verification link has expired. Please click <a href="${link}">here</a> to request a new verification email.`;

			return res.redirect("/login");
		}

		await verify.destroy({ where: { email } });
		await User.update({ email_verified_at: Date.now() }, { where: { email } });

		req.session.success_msg =
			"Your email has been successfully verified! You can now log in to ByteEats and start exploring delicious meals.";

		return res.redirect("/");
	} catch (err) {
		logger.error(`Error while verifying a user: ${err}`);

		return res.status(500).render("error", {
			message: "An internal server error occurred. Please try again later.",
		});
	}
};

export async function showLoginForm(req, res) {
	try {
		if (!req.session.isAuth) {
			const error_msg = req.session.error_msg;
			const success_msg = req.session.success_msg;
			delete req.session.error_msg;
			delete req.session.success_msg;

			return res.render("portal/auth/login", {
				error_msg,
				success_msg, 
			});
		} else {
			return res.status(404).render("errors/404", { message: "Page not found." });
		}
	} catch (err) {
		logger.error(`Error while rendering a login page: ${err}`);

		return res
			.status(500)
			.render("error", { message: "An internal server error occurred. Please try again later." });
	}
};

export async function login(req, res) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			req.session.error_msg =
				"Email/phone and password are required to log in.";

			return res.redirect("/");
		}

		const isEmail = email.includes("@");
		const userIdentifier = isEmail ? "email" : "phone";

		const user = await User.findOne({
			where: { [userIdentifier]: email, role: "user" },
		});

		if (!user || user.role !== "user" || !(await bcrypt.compare(password, user.password))) {
			req.session.error_msg = "Invalid login credentials.";

			return res.redirect("/login");
		}

		if (!user.email_verified_at) {
			await verify.destroy({ where: { email: user.email } });

			req.session.email = user.email;

			const link = `${config.app.url}/verifyEmail`;
			req.session.success_msg = `Your email address is not verified yet. Click <a href="${link}">here</a> to request a new verification link.`;

			return res.redirect("/login");
		}

		if (isEmail) {
			const otp = Math.floor(100000 + Math.random() * 900000);

			req.session.email = user.email;

			await verify.create({
				email: user.email,
				otp,
				created_at: new Date(),
				updated_at: new Date(),
			});

			try {
				await sendOTPEmail(
					user.email,
					"ByteEats - Login OTP",
					`
					<div style="font-family: Arial, sans-serif; line-height: 1.6;">
					<h2 style="color: #333;">Your ByteEats Login OTP</h2>
					<p>Use the following one-time password (OTP) to log in to your ByteEats account:</p>
					<p style="font-size: 1.5em; font-weight: bold; color: #2b6cb0; margin: 16px 0;">
						${otp}
					</p>
					<p>This OTP is valid for <strong>2 minutes</strong>. Do not share it with anyone.</p>
					<p>If you did not request this, please ignore this email.</p>
					<br>
					<p style="color: #888;">– The ByteEats Team</p>
					</div>
				`);

				req.session.success_msg =
            		"An OTP has been sent to your email. Please enter it to continue logging in.";

				return res.redirect("/verifyLogin");
			} catch (err) {
				logger.error(`Error while sending an otp: ${err}`);
				req.session.error_msg =
					"An internal server error occurred. Please try again later.";

				return res.redirect("/");
			}
		}

		if (!isEmail) {
			const otp = Math.floor(100000 + Math.random() * 900000);

			req.session.email = user.email;

			await verify.create({
				email: user.email,
				otp,
				created_at: new Date(),
				updated_at: new Date(),
			});

			const to = "+91" + String(identifier);

			req.session.phone = identifier;
			req.session.userId = user.id;
			req.session.success_msg =
        		"An OTP has been sent to your phone number. Please enter it to complete the login process.";

			await sendSms(
				to,
				`Your ByteEats OTP for login is: ${otp}`
			);

			return res.redirect("/verifyLogin");
		}
	} catch (err) {
		logger.error(`User login error: ${err}`);

		return res.status(500).render("errors/500", {
			message: "An internal server error occurred. Please try again later.",
		});
	}
};

export async function verifyLoginOtp(req, res) {
	try {
		const { otp } = req.body;
		const email = req.session.email;
		const isValid = await verify.findOne({ where: { email, otp } });
		
		if (!isValid) {
			req.session.error_msg =
        		"The OTP you entered is incorrect. Please check and try again.";

			return res.redirect("/verifyLogin");
		}

		const expiryTime = isValid.created_at.getTime() + 2 * 60 * 1000;

		if (Date.now() > expiryTime) {
			req.session.otp_expired = true;
			req.session.otp_expiry_timestamp = null;
			req.session.error_msg =
        		"The OTP has expired. Please request a new one to proceed.";

			return res.redirect("/verifyLogin");
		}

		const user = await User.findOne({ where: { email } });

		await isValid.destroy();

		req.session.otp_expired = false;
		req.session.otp_expiry_timestamp = expiryTime;
		req.session.userId = user.id;
		req.session.isAuth = true;
		req.session.success_msg = "You have successfully logged in to ByteEats.";

		return res.redirect("/dashboard");
	} catch (err) {
		logger.error(`Error while verifying an otp: ${err}`);

		return res
      		.status(500)
      		.render("error", {
				message: "An internal server error occurred. Please try again later.",
			});
	}
};

export async function getVerify(req, res) {
	try {
		const success_msg = req.session.success_msg;
		const error_msg = req.session.error_msg;
		const email = req.session.email;
		const otp_expiry_timestamp = req.session.otp_expiry_timestamp;
		const otp_expired = req.session.otp_expired || false;
		delete req.session.success_msg;
		delete req.session.error_msg;

		return res.render("portal/auth/verify", {
			email,
			success_msg,
			error_msg,
			otp_expired,
			otp_expiry_timestamp,
		});
	} catch (error) {
		logger.error("Error while rendering a verify page:", error);

		return res
			.status(500)
			.send("An internal server error occurred. Please try again later.");
	}
};

export async function resendOtp(req, res) {
	try {
		req.session.otp_expired = false;
		const email = req.body.email || req.session.email;

		if (!email) {
			req.session.error_msg = "Email address is missing.";

			return res.redirect("/verifyLogin");
		}

		const user = await User.findOne({ where: { email } });

		if (!user) {
			req.session.error_msg = "No user found with this email address.";

			return res.redirect("/verifyLogin");
		}

		const otp = Math.floor(100000 + Math.random() * 900000);
		req.session.otp_expiry_timestamp = Date.now() + 2 * 60 * 1000;
		req.session.otp_expired = false;

		await verify.create({
			email,
			otp,
			created_at: new Date(),
			updated_at: new Date(),
		});

		req.session.email = user.email;

		await sendOTPEmail(
			email,
			"ByteEats - Login OTP",
			`
			<div style="font-family: Arial, sans-serif; line-height: 1.6;">
			<h2 style="color: #333;">Your ByteEats Login OTP</h2>
			<p>Use the following one-time password (OTP) to log in to your ByteEats account:</p>
			<p style="font-size: 1.5em; font-weight: bold; color: #2b6cb0; margin: 16px 0;">
				${otp}
			</p>
			<p>This OTP is valid for <strong>2 minutes</strong>. Do not share it with anyone.</p>
			<p>If you did not request this, please ignore this email.</p>
			<br>
			<p style="color: #888;">– The ByteEats Team</p>
			</div>
		`);

		req.session.success_msg =
			"A new OTP has been sent to your registered email address.";

		return res.redirect("/verifyLogin");
	} catch (err) {
		logger.error("Error while resending an otp:", err);
		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";

		return res.redirect("/verifyLogin");
	}
};

export async function showForgotPasswordForm(req, res) {
	return res.render("portal/auth/forgot-password", {
		success_msg: req.session.success_msg,
		error_msg: req.session.error_msg,
	});
};

export async function sendResetPasswordLink(req, res) {
	try {
		const { email } = req.body;
		const user = await User.findOne({ where: { email } });

		if (!user) {
			req.session.error_msg =
				"We couldn't find an account associated with that email address.";

			return res.redirect("/forgot-password");
		}

		const token = crypto.randomBytes(32).toString("hex");
		const tokenExpiry = new Date(Date.now() + 3600000);

		user.resetPasswordToken = token;
		user.resetPasswordExpires = tokenExpiry;
		await user.save();

		const resetLink = `${config.app.url}/reset-password/${token}`;

		const toEmail = user.email;
		await sendOTPEmail(
			toEmail,
			"ByteEats - Password Reset Request",
			`
				<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
				<h2 style="color: #2b6cb0;">Password Reset Request</h2>
				<p>We received a request to reset the password for your <strong>ByteEats</strong> account.</p>
				<p>Click the button below to reset your password:</p>
				<p style="margin: 20px 0;">
					<a href="${resetLink}" style="background-color: #2b6cb0; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
					Reset Password
					</a>
				</p>
				<p>This link will expire in <strong>1 hour</strong>.</p>
				<p>If you did not request a password reset, please ignore this email. Your account is safe.</p>
				<br>
				<p style="color: #888;">– The ByteEats Team</p>
				</div>
		`);

		req.session.success_msg =
			"A password reset link has been sent to your email address.";

		if (user.role === "admin") {
			return res.redirect("/admin/login");
		}

		return res.redirect("/login");
	} catch (err) {
		logger.error("Error while sending a password reset link:", err);
		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";

		return res.redirect("/forgot-password");
	}
};

export async function showResetPasswordForm(req, res) {
	const user = await User.findOne({
		where: {
			resetPasswordToken: req.params.token,
			resetPasswordExpires: {
				[Op.gt]: new Date(),
			},
		},
	});

	if (!user) {
		req.session.error_msg =
		"The password reset link is invalid or has expired, Please request a new one.";

		return res.redirect("/forgot-password");
	}

	return res.render("portal/auth/reset-password", {
		token: req.params.token,
		success_msg: req.session.success_msg,
		error_msg: req.session.error_msg,
		errors: {},
	});
};

export async function resetPassword(req, res) {
	const { Password, confirmPassword } = req.body;
	const { error } = PasswordValidation.validate(req.body);

	let errors = {};	
	if (error) {
		errors = error.details.reduce((acc, err) => {
			acc[err.context.key] = err.message;
			return acc;
		}, {});
	}

	if (Password !== confirmPassword) {
		errors.confirmPassword = "Passwords do not match.";
	}

	if (Object.keys(errors).length > 0) {
		return res.render("portal/auth/reset-password", {
			token: req.params.token,
			errors,
			Password,
			confirmPassword,
			success_msg: null,
			error_msg: null,
		});
	}

	const user = await User.findOne({
		where: {
			resetPasswordToken: req.params.token,
			resetPasswordExpires: {
				[Op.gt]: new Date(),
			},
		},
	});

	if (!user) {
		req.session.error_msg =
			"The password reset link is invalid or has expired. Please request a new one.";

		return res.redirect("/forgot-password");
	}

	const hashedPassword = await bcrypt.hash(Password, 10);
	user.password = hashedPassword;
	user.resetPasswordToken = null;
	user.resetPasswordExpires = null;

	await user.save();

	req.session.success_msg =
		"Your password has been successfully reset! You can now log in to your ByteEats account.";

	if (user.role === "admin") {
		return res.redirect("/admin/login");
	}
	return res.redirect("/login");
};

export async function verifyEmailLink(req, res) {
	const email = req.session.email;

	if (!email) {
		req.session.error_msg =
			"No email session found. Please register or log in again.";

		return res.redirect("/login");
	}

	const token = crypto.randomBytes(32).toString("hex");

	await verify.create({
		email,
		otp: token,
		created_at: new Date(),
		updated_at: new Date(),
	});

	const verificationLink = `${config.app.url}/verify?email=${email}&token=${token}`;

	await sendOTPEmail(
		email,
		"ByteEats - Verify Your Email Address",
		`
		<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
		<h2 style="color: #e67e22;">Welcome to ByteEats!</h2>
		<p>
			We're excited to have you join us! To activate your account and start enjoying our delicious offerings, please confirm your email address by clicking the button below.
		</p>
		<p style="text-align: center; margin: 30px 0;">
			<a href="${verificationLink}" style="background-color: #e67e22; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
			Verify Email Address
			</a>
		</p>
		<p>
			If you did not sign up for ByteEats, please disregard this email.
		</p>
		<p>
			Thank you,<br/>
			<strong>The ByteEats Team</strong>
		</p>
		</div>
	`);

	delete req.session.email;

	req.session.success_msg =
		"A verification link has been sent to your email address. Please check your inbox (and spam folder) to complete your registration with ByteEats.";

	return res.redirect("/login");
};

export async function showChangePasswordForm(req, res) {
	const success_msg = req.session.success_msg;
	const error_msg = req.session.error_msg;
	req.session.success_msg = null;
	req.session.error_msg = null;

	const errors = {};
	const user = await User.findOne({ where: { id: req.session.userId } });
	
	if (user.role === "admin") {
		return res.render("admin/change-password", {
			success_msg,
			error_msg,
			errors,
		});
	}

	return res.render("portal/profile/change-password", {
		success_msg,
		error_msg,
		errors,
	});
};

export async function updatePassword(req, res) {
	try {
		const user = await User.findOne({ where: { id: req.session.userId } });
		const { oldPassword, Password, confirmPassword } = req.body;

		const { error } = changePasswordValidation.validate(req.body, {
			abortEarly: true,
		});

		let errors = {};
		if (error) {
			errors = error.details.reduce((acc, err) => {
				acc[err.context.key] = err.message;
				return acc;
			}, {});
		}

		if (Object.keys(errors).length > 0) {
			if (user.role === "admin") {
				return res.render("admin/change-password", {
					errors,
					oldPassword,
					Password,
					confirmPassword,
					success_msg: null,
					error_msg: null,
				});
			}

			return res.render("portal/profile/change-password", {
				errors,
				oldPassword,
				Password,
				confirmPassword,
				success_msg: null,
				error_msg: null,
			});
		}

		const match = await bcrypt.compare(oldPassword, user.password);
		
		if (!match) {
			if (user.role === "admin") {
				return res.render("admin/change-password", {
					errors: { oldPassword: "Old password is incorrect." },
					oldPassword,
					Password,
					confirmPassword,
					success_msg: null,
					error_msg: null,
				});
			}

			return res.render("portal/profile/change-password", {
				errors: { oldPassword: "Old password is incorrect." },
				oldPassword,
				Password,
				confirmPassword,
				success_msg: null,
				error_msg: null,
			});
		}

		if (Password !== confirmPassword) {
			if (user.role === "admin") {
				return res.render("admin/change-password", {
					errors: { confirmPassword: "Passwords do not match." },
					oldPassword,
					Password,
					confirmPassword,
					success_msg: null,
					error_msg: null,
				});
			}

			return res.render("portal/profile/change-password", {
				errors: { confirmPassword: "Passwords do not match." },
				oldPassword,
				Password,
				confirmPassword,
				success_msg: null,
				error_msg: null,
			});
		}

		const hashedPassword = await bcrypt.hash(Password, 10);

		user.password = hashedPassword;
		await user.save();

		req.session.success_msg = "Password changed successfully.";

		if (user.role === "admin") {
			return res.redirect("/admin/dashboard");
		}

		return res.redirect("/dashboard");
	} catch (err) {
		logger.error(`Error while changing a password: ${err}`);

		return res
			.status(500)
			.render("500", {
				message: "An internal server error occurred. Please try again later.",
			});
	}
};

export async function showProfile(req, res) {
	const user = await User.findOne({ where: { id: req.session.userId } });
	const success_msg = req.session.success_msg;
	const error_msg = req.session.error_msg;
	req.session.success_msg = null;
	req.session.error_msg = null;
	const errors = {};
	
	return res.render("portal/profile/update", {
		user,
		errors,
		success_msg,
		error_msg,
	});
};

export async function updateProfile(req, res) {
	try {
		const { name, email, phone } = req.body;

		const { error } = updateProfileValidation.validate(req.body);

		let errors = {};
		if (error) {
			errors = error.details.reduce((acc, err) => {
				acc[err.context.key] = err.message;
				return acc;
			}, {});
		}

		const user = await User.findOne({ where: { id: req.session.userId } });

		if (!user) {
			req.session.error_msg = "User not found.";

			return res.redirect("/login");
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
			return res.render("portal/profile/update", {
				errors,
				user: {
					...user.toJSON(),
					name,
					email,
					phone,
				},
			});
		}

		user.name = name;
		user.email = email;
		user.phone = phone;

		if (req.file) {
			user.avatar = req.file.filename;
		}

		await user.save();

		req.session.success_msg = "Profile updated successfully.";

		return res.redirect("/dashboard");
	} catch (err) {
		logger.error(`Error while updating a profile: ${err}`);

		return res
			.status(500)
			.render("500", {
				message: "An internal server error occurred. Please try again later.",
			});
	}
};

export async function showHomePage(req, res) {

   const foodItems = await foodItem.findAll({
		where: { deleted_at: null },
		include: [{ model: db.Category, attributes: ["name"] }],
	});

	let error_msg = null;
	let success_msg = null;

	if (req.session.error) {
		error_msg = req.session.error;
		delete req.session.error;
	}

	if (req.session.success) {
		success_msg = req.session.success;
		delete req.session.success;
	}
	if (req.session.isAuth) {
		const user = await User.findOne({ where: { id: req.session.userId } });

		if (user.role === "admin") {
			return res.redirect("/admin/dashboard");
		} else {
			return res.redirect("/dashboard");
		}
	}

	return res.render("portal/home", { error_msg, success_msg, fooditems:foodItems });
}

export async function getFoodDetails(req, res) {
     try {
        const foodId = req.params.id;

        const food = await foodItem.findOne({
            where: { id: foodId },
            include: [Category],
        });

        if (!food) {
            return res.status(404).render("errors/404", { message: "Food item not found." });
        }

        return res.render("portal/foodDetail", { 
			food,
			success_msg:req.session.success_msg,
			error_msg:req.session.error_msg
		});
    } catch (err) {
        logger.error(`Error while fetching food item: ${err}`);

        return res
			.status(500)
			.render("errors/500", {
				message:
				"An internal server error occurred. Please try again later.",
			});
    }
}

export async function logout(req, res) {
	try {
		const user = await User.findOne({ where: { id: req.session.userId } });

		req.session.destroy((err) => {
			if (err) {
				logger.error(`Error destroying session during logout: ${err}`);

				return res.status(500).render("error", {
					message: "Something went wrong while logging you out.",
				});
			}

			res.clearCookie("connect.sid");

			if (user.role === "admin") {
				return res.redirect("/admin/login");
			}

			return res.redirect("/login");
		});
	} catch (err) {
		logger.error(`Error while logout: ${err}`);

		return res.status(500).render("error", {
			message: "An internal server error occurred. Please try again later.",
		});
	}
};