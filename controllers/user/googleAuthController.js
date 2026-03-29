import db from "../../models/index.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import config from '../../config/app.js'

const User = db.User;

dotenv.config();

const CLIENT_URL = `${process.env.APP_URL}:${config.app.port}`;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = `${CLIENT_URL}/google/redirect`;

export async function handleGoogleCallback(req, res) {
	const { code } = req.query;
	try {
		const { data } = await axios.post("https://oauth2.googleapis.com/token", {
			client_id: GOOGLE_CLIENT_ID,
			client_secret: GOOGLE_CLIENT_SECRET,
			code,
			grant_type: "authorization_code",
			redirect_uri: GOOGLE_REDIRECT_URI,
		});

		const { access_token, refresh_token } = data;
		
		const googleUser = await axios.get(
			`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`
		);

		const hashedPassword = await bcrypt.hash("googleauthsecret9@123", 10);
		let user = await User.findOne({ where: { googleId: googleUser.data.id } });

		if (!user) {
			user = await User.findOne({ where: { email: googleUser.data.email } });

			if (user) {
				await user.update({ googleId: googleUser.data.id });
			} else {
				user = await User.create({
					name: googleUser.data.name,
					email: googleUser.data.email,
					phone: 0,
					password: hashedPassword,
					email_verified_at: Date.now(),
					avatar: googleUser.data.picture,
					google_id: googleUser.data.id,
				});
			}
		}

		const token = jwt.sign(
			{ id: user._id },
			process.env.JWT_ACCESS_TOKEN_SECRET,
			{
				expiresIn: "1h",
			}
		);
		
		req.session.userId = user.id;
		req.session.isAuth = true;

		return res.redirect("/dashboard");
	} catch (error) {
		logger.error(
			"Google OAuth Error:",
			error.response ? error.response.data : error.message
		);
	
		return res.status(500).json({
			error: "Authentication failed",
			details: error.response ? error.response.data : error.message,
		});
	}
};

export async function redirectToGoogle(req, res) {
  	const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`;
  
 	return res.redirect(authUrl);
};