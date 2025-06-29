import { NextFunction, Request, Response } from "express";
import { appError } from "../../error/appError";
import { Tweet } from "../../../dal/entity/tweet.entity";
import { User } from "../../../dal/entity/user.entity";
import {
  Notification,
  NotificationType,
} from "../../../dal/entity/notfication.entity";
import { Comment } from "../../../dal/entity/comment.entity";
import io, { getReceiverSocketId } from "../../../socket/socket";

const createTweet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { text } = req.body;
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    const imageFile = files?.image?.[0];
    const videoFile = files?.video?.[0];

    if ((imageFile && videoFile) || (!imageFile && !videoFile && !text)) {
      return next(
        new appError(
          "You must provide either an image or a video, but not both.",
          400
        )
      );
    }

    if (!text && !imageFile && !videoFile) {
      return next(new appError("Please provide text, image, or video", 400));
    }

    const newTweet = new Tweet();
    newTweet.user = user;
    newTweet.text = text || "";

    if (imageFile) {
      newTweet.image = imageFile.path;
    }

    if (videoFile) {
      newTweet.video = videoFile.path;
    }

    await newTweet.save();

    const tweet = await Tweet.createQueryBuilder("tweet")
      .leftJoinAndSelect("tweet.user", "user")
      .leftJoinAndSelect("tweet.comments", "comments")
      .leftJoinAndSelect("comments.user", "commentUser")
      .leftJoinAndSelect("tweet.bookmarks", "bookmarks")
      .leftJoinAndSelect("tweet.likes", "likes")
      .where("tweet.id = :id", { id: newTweet.id })
      .getOne();

    if (!tweet) return next(new appError("Tweet not found", 404));

    io.emit("newTweet", {
      tweet: tweet,
    });

    res.status(201).json({
      status: "success",
      message: "Tweet created successfully",
      tweet: tweet,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const likeTweet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const id = Number(req.params.id);

    const existUser = await User.findOne({
      where: { id: user.id },
    });
    if (!existUser) {
      return next(new appError("user not found", 404));
    }

    const existTweet = await Tweet.createQueryBuilder("tweet")
      .leftJoinAndSelect("tweet.user", "user")
      .leftJoinAndSelect("tweet.comments", "comments")
      .leftJoinAndSelect("comments.user", "commentUser")
      .leftJoinAndSelect("tweet.bookmarks", "bookmarks")
      .leftJoinAndSelect("tweet.likes", "likes")
      .where("tweet.id =:id", { id })
      .getOne();

    if (!existTweet) {
      return next(new appError("tweet not found", 404));
    }

    const alreadyLiked = existTweet.likes.some(
      (like) => like.id === existUser.id
    );

    if (alreadyLiked) {
      existTweet.likes = existTweet.likes.filter(
        (like) => like.id !== existUser.id
      );
    } else {
      existTweet.likes.push(existUser);
    }

    await existTweet.save();

    if (!alreadyLiked && existUser.id !== existTweet.user.id) {
      const notification = Notification.create({
        fromUser: existUser,
        toUser: existTweet.user,
        title: "New Like",
        message: `${existUser.username} liked your post.`,
        type: NotificationType.like,
      });

      await notification.save();

      const receiverId = getReceiverSocketId(existTweet.user?.id);

      if (receiverId) {
        io.to(receiverId).emit("newNotification", {
          notification,
        });
      }
    }

    const likeStatus = !alreadyLiked;

    io.emit("tweetLikeStatusChange", {
      tweetId: existTweet.id,
      likeStatus,
      user: existUser,
    });

    res.status(200).json({
      success: true,
      post: existTweet,
      liked: !alreadyLiked,
    });
  } catch (error) {
    next(error);
  }
};

const getTweet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return next(new appError("Invalid parameters", 400));
    }

    const tweet = await Tweet.createQueryBuilder("tweet")
      .leftJoinAndSelect("tweet.user", "user")
      .leftJoinAndSelect("tweet.comments", "comments")
      .leftJoinAndSelect("comments.user", "commentUser")
      .leftJoinAndSelect("tweet.bookmarks", "bookmarks")
      .leftJoinAndSelect("tweet.likes", "likes")
      .orderBy("tweet.created_at", "DESC")
      .where("tweet.id = :id", { id })
      .getOne();

    if (!tweet) {
      return next(new appError("Post not found", 404));
    }

    res.status(200).json({ success: true, tweet });
  } catch (error) {
    next(error);
  }
};

const commentTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return next(new appError("Invalid parameters", 400));
    }

    const { text } = req.body;
    if (!text) {
      return next(new appError("Please provide a comment text", 400));
    }

    const existUser = await User.findOne({ where: { id: user.id } });
    if (!existUser) {
      return next(new appError("User not found", 404));
    }

    const existTweet = await Tweet.findOne({
      where: { id },
      relations: ["comments", "user"],
    });

    if (!existTweet) {
      return next(new appError("Post not found", 404));
    }

    const newComment = Comment.create({
      text,
      tweet: existTweet,
      user: existUser,
    });
    await newComment.save();

    if (existUser.id !== existTweet.user.id) {
      const notification = Notification.create({
        fromUser: existUser,
        toUser: existTweet.user,
        title: "New Comment",
        message: `${existUser.username} commented on your post.`,
        type: NotificationType.comment,
      });
      await notification.save();

      const receiverId = getReceiverSocketId(existTweet.user?.id);

      if (receiverId) {
        io.to(receiverId).emit("newNotification", {
          notification,
        });
      }
    }
    io.emit("tweetNewComment", {
      tweetId: existTweet.id,
      comment: newComment,
    });

    res
      .status(200)
      .json({ success: true, comment: newComment, tweet: existTweet });
  } catch (error) {
    next(error);
  }
};

const deleteTweet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return next(new appError("Invalid parameters", 400));
    }
    const existTweet = await Tweet.findOne({
      where: { id },
      relations: ["user"],
    });
    if (!existTweet) {
      return next(new appError("Tweet not found", 404));
    }

    if (existTweet.user.id !== user.id && user.role !== "ADMIN") {
      return next(
        new appError("You are not authorized to delete this tweet", 403)
      );
    }

    await existTweet.remove();

    io.emit("deleteTweet", {
      tweetId: id,
    });

    res.status(200).json({
      success: true,
      message: "Tweet deleted successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getAllTweets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { page, limit } = req.body;
    page = Number(page) || 1;
    limit = Number(limit) || 5;
    const skip = (page - 1) * limit;

    const [totalTweets, tweets] = await Promise.all([
      Tweet.count(),
      Tweet.createQueryBuilder("tweet")
        .leftJoinAndSelect("tweet.user", "user")
        .leftJoinAndSelect("tweet.comments", "comments")
        .leftJoinAndSelect("comments.user", "commentUser")
        .leftJoinAndSelect("tweet.bookmarks", "bookmarks")
        .leftJoinAndSelect("tweet.likes", "likes")
        .orderBy("tweet.created_at", "DESC")
        .take(limit)
        .skip(skip)
        .getMany(),
    ]);

    res.status(200).json({
      success: true,
      tweets,
      page,
      limit,
      totalTweets,
      totalPages: Math.ceil(totalTweets / limit),
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const likedUserTweets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new appError("Invalid parameters", 400));
    }

    const existUser = await User.findOne({
      where: { id: Number(id) },
    });
    if (!existUser) {
      return next(new appError("User not found", 404));
    }

    const likedTweets = await Tweet.createQueryBuilder("tweet")
      .leftJoinAndSelect("tweet.user", "user")
      .leftJoinAndSelect("tweet.comments", "comments")
      .leftJoinAndSelect("comments.user", "commentUser")
      .leftJoinAndSelect("tweet.bookmarks", "bookmarks")
      .leftJoinAndSelect("tweet.likes", "likes")
      .orderBy("tweet.created_at", "DESC")
      .where("likes.id = :id", { id: id })
      .getMany();

    res.status(200).json({
      success: true,
      data: likedTweets,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const followingUserTweets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      relations: ["following"],
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    let { page, limit } = req.body;
    page = Number(page) || 1;
    limit = Number(limit) || 5;
    const skip = (page - 1) * limit;

    const followingIds = user.following.map((f) => f.id);

    if (followingIds.length === 0) {
      res.status(200).json({
        success: true,
        tweets: [],
        page,
        limit,
        totalTweets: 0,
        totalPages: 0,
      });
      return;
    }

    const [totalTweets, tweets] = await Promise.all([
      Tweet.createQueryBuilder("tweet")
        .leftJoin("tweet.user", "user")
        .where("user.id IN (:...followingIds)", { followingIds })
        .getCount(),

      Tweet.createQueryBuilder("tweet")
        .leftJoinAndSelect("tweet.likes", "likes")
        .leftJoinAndSelect("tweet.comments", "comments")
        .leftJoinAndSelect("comments.user", "commentUser")
        .leftJoinAndSelect("tweet.bookmarks", "bookmarks")
        .leftJoinAndSelect("tweet.user", "user")
        .where("user.id IN (:...followingIds)", { followingIds })
        .orderBy("tweet.created_at", "DESC")
        .take(limit)
        .skip(skip)
        .getMany(),
    ]);

    res.status(200).json({
      success: true,
      tweets,
      page,
      limit,
      totalTweets,
      totalPages: Math.ceil(totalTweets / limit),
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getUserTweets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return next(new appError("Invalid parameters", 400));
    }

    const existUser = await User.findOne({
      where: { id },
    });
    if (!existUser) {
      return next(new appError("User not found", 404));
    }

    const userTweets = await Tweet.createQueryBuilder("tweet")
      .leftJoinAndSelect("tweet.user", "user")
      .leftJoinAndSelect("tweet.comments", "comments")
      .leftJoinAndSelect("comments.user", "commentUser")
      .leftJoinAndSelect("tweet.bookmarks", "bookmarks")
      .leftJoinAndSelect("tweet.likes", "likes")
      .orderBy("tweet.created_at", "DESC")
      .orderBy("tweet.created_at", "DESC")
      .where("user.id = :id", { id })
      .getMany();

    res.status(200).json({
      success: true,
      data: userTweets,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const bookMarkTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = Number(req.params.id);

    const existUser = await User.findOne({
      where: { id: user.id },
    });
    if (!existUser) {
      return next(new appError("user not found", 404));
    }

    const existPost = await Tweet.findOne({
      where: { id: id },
      relations: {
        likes: true,
        comments: true,
        user: true,
        bookmarks: true,
      },
    });

    if (!existPost) {
      return next(new appError("post not found", 404));
    }

    const existBookmark = existPost.bookmarks.some(
      (b) => b.id === existUser.id
    );

    if (existBookmark) {
      existPost.bookmarks = existPost.bookmarks.filter(
        (b) => b.id !== existUser.id
      );
      await existPost.save();
      res.status(200).json({
        success: true,
        bookMark: false,
        message: "Tweet unbookmarked successfully",
        post: existPost,
      });
      return;
    } else {
      existPost.bookmarks.push(existUser);
      await existPost.save();
      if (existUser.id !== existPost.user.id) {
        const notification = Notification.create({
          fromUser: existUser,
          toUser: existPost.user,
          title: "New Bookmark",
          message: `${existUser.username} bookmarked your post.`,
          type: NotificationType.bookmark,
        });
        await notification.save();

        const receiverId = getReceiverSocketId(existPost.user.id);

        if (receiverId) {
          io.to(receiverId).emit("newNotification", {
            notification,
            data: existPost,
          });
        }
      }
      res.status(200).json({
        success: true,
        bookMark: true,
        message: "Post bookmarked successfully",
        post: existPost,
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};

const getBookmarkedTweets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new appError("Invalid parameters", 400));
    }
    const existUser = await User.findOne({
      where: { id: Number(id) },
    });
    if (!existUser) {
      return next(new appError("User not found", 404));
    }

    const bookmarkedTweets = await Tweet.createQueryBuilder("tweet")
      .leftJoinAndSelect("tweet.user", "user")
      .leftJoinAndSelect("tweet.comments", "comments")
      .leftJoinAndSelect("comments.user", "commentUser")
      .leftJoinAndSelect("tweet.bookmarks", "bookmarks")
      .leftJoinAndSelect("tweet.likes", "likes")
      .orderBy("tweet.created_at", "DESC")
      .where("bookmarks.id = :id", { id: id })
      .getMany();

    res.status(200).json({
      success: true,
      data: bookmarkedTweets,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const tweetController = () => {
  return {
    createTweet,
    likeTweet,
    commentTweet,
    getTweet,
    deleteTweet,
    getAllTweets,
    likedUserTweets,
    getUserTweets,
    bookMarkTweet,
    followingUserTweets,
    getBookmarkedTweets,
  };
};
