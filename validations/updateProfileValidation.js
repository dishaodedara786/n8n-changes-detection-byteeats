import Joi from "joi";

const updateProfileValidation = Joi.object({
	name: Joi.string()
		.pattern(/^[a-zA-Z\s.'-]+$/)
		.min(3)
		.max(18)
		.messages({
			"string.pattern.base":
				"Name must not contain numbers or special characters. Only letters, spaces, dots, hyphens, and apostrophes are allowed.",
			"string.min": "Name must be at least 3 characters long.",
			"string.max": "Name must be less than 50 characters.",
			"any.required": "Name is required.",
			"string.empty": "Name cannot be empty.",
		}),
	email: Joi.string().email().messages({
		"string.email": "Email must be a valid email.",
	}),
	phone: Joi.string()
		.pattern(/^\+?[0-9()-]*$/)
		.min(10)
		.messages({
			"string.pattern.base":
				"Phone number must be a valid number with optional +, digits, (), or -.",
			"string.min": "Phone number must be at least 10 digits long.",
		}),
	role: Joi.string().messages({
		"string.empty": "Role cannot be empty.",
	}),
});

export default updateProfileValidation;