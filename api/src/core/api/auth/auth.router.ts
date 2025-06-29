import express from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middleware/auth";
export const authRouter = express.Router();
const controller = authController();

authRouter.post("/register", controller.register);
authRouter.post("/login", controller.login);
authRouter.get("/setAccessToken", controller.refreshTokenController);
authRouter.get("/logout", auth, controller.logout);
authRouter.post("/forgotPassword", controller.forgotPassword);
authRouter.post("/otpVerify", controller.verifyForgotPassword);
authRouter.post("/resetPassword", controller.resetPassword);
