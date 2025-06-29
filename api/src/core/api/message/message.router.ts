import express from "express";
import { messageController } from "./message.controller";
import { auth } from "../../middleware/auth";

export const messageRouter = express.Router();

const controller = messageController();

messageRouter.post("/send/:id", auth, controller.sendMessage);
messageRouter.get("/getMessages/:id", auth, controller.getMessage);
messageRouter.get("/userConversations", auth, controller.getUserConversations);
