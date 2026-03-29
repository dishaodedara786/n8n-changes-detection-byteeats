import nodemailer from "nodemailer";
import config from "../config/app.js";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: config.email.user,
		pass: config.email.pass,
	},
});

const sendOTPEmail = async (email, subject, message) => {
	await transporter.sendMail({
		from: config.email.user,
		to: email,
		subject: subject,
		html: message,
	});
};

export default sendOTPEmail;