import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import db from "./models/index.js";
import config from "./config/app.js";
import sessionMiddleware from "./config/session.js";
import logger from "./config/logger.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { sequelize } = db;
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(sessionMiddleware);

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", userRouter);
app.use("/admin", adminRouter);

app.get("/",(req, res) => {
	if (!req.session.isAuth) {
		return res.redirect("/login");
	} else {
		return res.status(404).render("errors/404", { message: "Page not found" });
	}
});

app.use((err, req, res, next) => {
  	logger.error(err.stack);
  
	return res
		.status(500)
		.render("errors/500", { message: "Something went wrong." });
});

sequelize
	.authenticate()
  	.then(() => {
		app.listen(config.app.port, () => {
console.log("connected successfully ...")
			logger.info(`Database connected & Server is running on port: ${config.app.port}`);
		});
  	}).catch((err) => {
    	logger.error("Error connecting to database:", err);
  	});