import twilio from "twilio";
import logger from "../config/logger.js";
import config from "../config/app.js";

const accountSid = config.twillio.sid;
const authToken =config.twillio.auth_token;
const client = twilio(accountSid, authToken);

const sendSms = async (to, body) => {
	try {
		const message = await client.messages.create({
			from: "+16625774817",
			to,
			body,
		});

		return message.sid;
	} catch (err) {
		logger.error(`Error while sending an sms: ${err}`);

		throw err;
	}
};

export default sendSms;