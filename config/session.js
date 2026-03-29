import session from "express-session";
import SequelizeStoreInit from "connect-session-sequelize";
import db from "../models/index.js";
import config from "./app.js";

const SequelizeStore = SequelizeStoreInit(session.Store);

const store = new SequelizeStore({
  	db: db.sequelize,
});

store.sync();

const sessionMiddleware = session({
	secret: config.session_secret,
	resave: false,
	saveUninitialized: false,
	store: store,
	cookie: {
		maxAge: 24 * 60 * 60 * 1000,
		secure: false,
	},
});

export default sessionMiddleware;