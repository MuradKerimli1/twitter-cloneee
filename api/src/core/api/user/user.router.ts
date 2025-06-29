import express from "express";
import { userController } from "./user.controller";
import { auth } from "../../middleware/auth";
import { parser } from "../../services/multer-cloudinary";
export const userRouter = express.Router();

const controller = userController();

userRouter.get("/profile/:id", auth, controller.getProfile);
userRouter.get("/follow/:id", auth, controller.followAndUnfollowUser);
userRouter.post("/suggestions", auth, controller.getSuggestions);
userRouter.get("/search/:username", auth, controller.searchUser);
userRouter.put(
  "/update",
  auth,
  parser.fields([{ name: "imageUrl" }, { name: "coverUrl" }]),
  controller.updateUser
);
