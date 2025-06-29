import express from "express";
import { authRouter } from "../api/auth/auth.router";
import { userRouter } from "../api/user/user.router";
import { tweetRouter } from "../api/tweet/tweet.router";
import { notficationRouter } from "../api/notfication/notfication.router";
import { messageRouter } from "../api/message/message.router";
import { premiumRouter } from "../api/premium/premium.router";

export const mainRouter = express.Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/user", userRouter);
mainRouter.use("/tweet", tweetRouter);
mainRouter.use("/notfication", notficationRouter);
mainRouter.use("/message", messageRouter);
mainRouter.use("/premium", premiumRouter);
