import Joi from "joi";

const signupValidation = Joi.object({
	name: Joi.string()
		.pattern(/^[a-zA-Z\s.'-]+$/)
		.min(3)
		.max(18)
		.required()
		.messages({
			"string.pattern.base":
				"Name must not contain numbers or special characters. Only letters, spaces, dots, hyphens, and apostrophes are allowed.",
			"string.min": "Name must be at least 3 characters long.",
			"string.max": "Name must be less than 50 characters.",
			"any.required": "Name is required.",
			"string.empty": "Name cannot be empty.",
		}),
	email: Joi.string().email().required().messages({
		"string.email": "Email must be a valid email address.",
	}),
	phone: Joi.string()
		.pattern(/^\+?[0-9()-]*$/)
		.min(10)
		.required()
		.messages({
			"string.pattern.base":
				"Phone number must be a valid number with optional +, digits, (), or -.",
			"string.min": "Phone number must be at least 10 digits long.",
		}),
	password: Joi.string()
		.min(8)
		.max(16)
		.pattern(
			new RegExp(
				"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
			)
		)
		.required()
		.messages({
			"string.empty": "Password cannot be empty.",
			"string.min": "Password must be at least 8 characters long.",
			"string.max": "Password must not exceed 16 characters.",
			"string.pattern.base":
				"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., P@ssw0rd!).",
			"any.required": "Password is required.",
		}),
	confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
		"any.only": "Passwords do not match.",
		"any.required": "Confirm Password is required.",
	}),
});

export default signupValidation;
