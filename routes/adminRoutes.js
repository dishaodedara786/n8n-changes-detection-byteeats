import express from "express";

import * as AdminAuthController from "../controllers/admin/authController.js";
import * as AuthController from "../controllers/user/authController.js";
import * as DashboardController from "../controllers/admin/dashboardController.js";
import * as UserController from "../controllers/admin/userController.js";
import * as CategoryController from "../controllers/admin/categoryController.js";
import * as FoodItemController from "../controllers/admin/foodItemController.js";

import { checkAdminAuth } from "../middlewares/checkAuth.js";

import upload from "../services/upload.js";

const adminRouter = express.Router();

adminRouter.get("/login", AdminAuthController.showLoginForm);
adminRouter.post("/login", AdminAuthController.login);

adminRouter.get("/change-password", checkAdminAuth, AuthController.showChangePasswordForm);
adminRouter.post("/change-password", checkAdminAuth, AuthController.updatePassword);

adminRouter.get("/dashboard", checkAdminAuth, DashboardController.index);

adminRouter.get("/users", UserController.index);
adminRouter.get("/create/user", UserController.create);
adminRouter.post("/create/user", upload.single("avatar"), UserController.store);
adminRouter.get("/edit/user/:id", UserController.edit);
adminRouter.post("/edit/user/:id", upload.single("avatar"), UserController.update);
adminRouter.get("/view/user/:id", UserController.show);
adminRouter.post("/delete/user/:id", UserController.destroy);

adminRouter.get("/categories", CategoryController.index);
adminRouter.get("/create/category", CategoryController.create);
adminRouter.post("/create/category", CategoryController.store);
adminRouter.get("/view/category/:id", CategoryController.show);
adminRouter.get("/edit/category/:id", CategoryController.edit);
adminRouter.post("/edit/category/:id", CategoryController.update);
adminRouter.get("/delete/category/:id", CategoryController.destroy);

adminRouter.get("/food-items", FoodItemController.index);
adminRouter.get("/create/food-item", FoodItemController.create);
adminRouter.post("/create/food-item", upload.single("image"), FoodItemController.store);
adminRouter.get("/edit/food-item/:id", FoodItemController.edit);
adminRouter.post("/edit/food-item/:id", upload.single("image"), FoodItemController.update);
adminRouter.get("/view/food-item/:id", FoodItemController.show);
adminRouter.post("/delete/food-item/:id", FoodItemController.destroy);

// adminRouter.get("/logout", checkAdminAuth, AuthController.logout);

export default adminRouter;