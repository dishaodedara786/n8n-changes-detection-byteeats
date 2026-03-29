import express from "express";

import * as AuthController from "../controllers/user/authController.js";
import * as GoogleController from "../controllers/user/googleAuthController.js";
import * as DashboardController from "../controllers/user/dashboardController.js";
import * as CartController from "../controllers/user/cartController.js";
import * as WishlistController from "../controllers/user/wishlistController.js";

import { checkUserAuth, isAuth } from "../middlewares/checkAuth.js";

import upload from "../services/upload.js";

const userRouter = express.Router();

userRouter.get("/register", AuthController.showRegistrationForm);
userRouter.post("/register", upload.single("avatar"), AuthController.register);

userRouter.get("/verifyEmail", AuthController.verifyEmailLink);
userRouter.get("/verify", AuthController.verifyUser);
userRouter.get("/verifyLogin", AuthController.getVerify);
userRouter.post("/verifyLogin", AuthController.verifyLoginOtp);
userRouter.post("/send-otp", AuthController.resendOtp);

userRouter.get("/login", AuthController.showLoginForm);
userRouter.post("/login", AuthController.login);

userRouter.get("/forgot-password", AuthController.showForgotPasswordForm);
userRouter.post("/forgot-password", AuthController.sendResetPasswordLink);
userRouter.get("/reset-password/:token", AuthController.showResetPasswordForm);
userRouter.post("/reset-password/:token", AuthController.resetPassword);

userRouter.get("/google", GoogleController.redirectToGoogle);
userRouter.get("/google/rediret", GoogleController.handleGoogleCallback);

userRouter.get("/change-password", isAuth, AuthController.showChangePasswordForm);
userRouter.post("/change-password", AuthController.updatePassword);

userRouter.get("/dashboard", checkUserAuth, DashboardController.index);
userRouter.get("/home", AuthController.showHomePage);

userRouter.get("/profile", isAuth, AuthController.showProfile);
userRouter.post("/update-profile", upload.single("avatar"), AuthController.updateProfile);

userRouter.get("/foodDetail/:id", AuthController.getFoodDetails);

userRouter.get("/cart", CartController.index);
userRouter.get("/cart/:id", CartController.show);
userRouter.post("/cart/add/:id", CartController.store);
userRouter.post("/cart/update/:id", CartController.update);
userRouter.post("/cart/remove/:id", CartController.destroy);

userRouter.get("/wishlists", WishlistController.index);
userRouter.post("/wishlists/add/:id", WishlistController.store);
userRouter.get("/wishlists/:id", WishlistController.show);
userRouter.post("/wishlists/remove/:id", WishlistController.destroy);

userRouter.get("/logout", isAuth, AuthController.logout);

export default userRouter;