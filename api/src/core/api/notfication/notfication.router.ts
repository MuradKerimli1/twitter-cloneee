import express from "express";
import { notficationController } from "./notifcation.controller";
import { auth } from "../../middleware/auth";
export const notficationRouter = express.Router();
const controller = notficationController();

notficationRouter.get("/user", auth, controller.getNotification);
notficationRouter.delete("/", auth, controller.deleteNotification);
notficationRouter.delete(
  "/delete/:id",
  auth,
  controller.deleteNotificationById
);
