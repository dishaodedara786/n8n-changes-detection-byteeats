import joi from "joi";

const changePasswordValidation = joi.object({
	oldPassword: joi.string().required(),
	Password: joi
		.string()
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
				"Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., Example@123).",
			"any.required": "Password is required.",
		}),
	confirmPassword: joi.string().required().valid(joi.ref("Password")).messages({
		"any.only": "Passwords do not match.",
		"any.required": "Confirm Password is required.",
	}),
});

export default changePasswordValidation;
