import express from "express";
import { tweetController } from "./tweet.controller";
import { auth } from "../../middleware/auth";
import { parser } from "../../services/multer-cloudinary";
export const tweetRouter = express.Router();
const controller = tweetController();

tweetRouter.post(
  "/create",
  auth,
  parser.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  controller.createTweet
);

tweetRouter.get("/like/:id", auth, controller.likeTweet);
tweetRouter.post("/comment/:id", auth, controller.commentTweet);

tweetRouter.post("/all", auth, controller.getAllTweets);
tweetRouter.get("/:id", auth, controller.getTweet);
tweetRouter.delete("/:id", auth, controller.deleteTweet);
tweetRouter.get("/liked/userTweets/:id", auth, controller.likedUserTweets);
tweetRouter.post("/following/userTweets", auth, controller.followingUserTweets);
tweetRouter.get("/user/:id", auth, controller.getUserTweets);
tweetRouter.get("/bookmark/:id", auth, controller.bookMarkTweet);
tweetRouter.get(
  "/bookmarks/userTweets/:id",
  auth,
  controller.getBookmarkedTweets
);
