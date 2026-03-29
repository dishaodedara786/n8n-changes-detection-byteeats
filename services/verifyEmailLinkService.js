import crypto from "crypto";

import db from "../models/index.js";
import sendOTPEmail from "./mailService.js";
import config from "../config/app.js";

const verify = db.EmailVerification;

const verifyEmail = async (email) => {
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
        `
    );
};

export default verifyEmail;