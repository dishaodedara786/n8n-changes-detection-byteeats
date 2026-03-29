import dotenv from "dotenv";

dotenv.config();

const config = {
	twillio:{
		sid:process.env.TWILIO_ACCOUNT_SID,
		auth_token:process.env.TWILIO_AUTH_TOKEN
	},
	app: {
		url: process.env.APP_URL,
		port: process.env.PORT,
		environment: process.env.APP_ENV,
	},
	email: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
	session_secret: process.env.SESSION_SECRET
};

export default config;