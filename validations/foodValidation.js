import Joi from "joi";

const foodValidation = Joi.object({
	name: Joi.string()
		.min(3)
		.required()
		.messages({
			'string.base': 'Name must be a string.',
			'string.empty': 'Name is required.',
			'string.min': 'Name must be at least 3 characters long.',
			'any.required': 'Name is required.'
		}),
	category_id: Joi.number()
		.required()
		.messages({
			'number.base': 'Category ID must be a number.',
			'any.required': 'Category ID is required.'
		}),
	price: Joi.number()
		.positive()
		.required()
		.messages({
			'number.base': 'Price must be a number.',
			'number.positive': 'Price must be a positive number.',
			'any.required': 'Price is required.'
		}),
	stock: Joi.number()
		.integer()
		.min(0)
		.required()
		.messages({
			'number.base': 'Stock must be a number.',
			'number.integer': 'Stock must be an integer.',
			'number.min': 'Stock cannot be negative.',
			'any.required': 'Stock is required.'
		}),
});

export default foodValidation;