import otpGenerator from "otp-generator";
import logger from "../config/logger.js";

const GenerateOtp = () => {
	try {
		const otp = otpGenerator.generate(6, {
			digits: true,
			alphabets: false,
			upperCase: false,
			specialChars: false,
		});

		return otp;
	} catch (err) {
		logger.error(`Error while generating an otp: ${err}`);

		throw err;
	}
};

export default GenerateOtp;