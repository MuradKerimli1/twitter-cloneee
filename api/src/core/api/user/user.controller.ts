import { NextFunction, Request, Response } from "express";
import { appError } from "../../error/appError";
import { User } from "../../../dal/entity/user.entity";
import {
  Notification,
  NotificationType,
} from "../../../dal/entity/notfication.entity";
import bcrypt from "bcrypt";
import { Gender } from "../../../dal/enums/genderEnum";
import io, { getReceiverSocketId } from "../../../socket/socket";

const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const loggedInUserId = req.user?.id;
    let visible = true;

    if (!id) {
      return next(new appError("User ID is required", 400));
    }

    const user = await User.createQueryBuilder("user")
      .leftJoinAndSelect("user.followers", "followers")
      .leftJoinAndSelect("user.following", "following")
      .leftJoinAndSelect("user.tweets", "tweet")
      .leftJoinAndSelect("user.viewers", "viewers")
      .where("user.id = :id", { id })
      .getOne();

    if (!user) {
      return next(new appError("User not found", 404));
    }

    if (loggedInUserId && loggedInUserId !== id && user.isPremium) {
      const viewerUser = await User.findOne({ where: { id: loggedInUserId } });

      if (
        viewerUser &&
        !user.viewers.some((viewer) => viewer.id === loggedInUserId)
      ) {
        user.viewers.push(viewerUser);
        await user.save();

        const receiverId = getReceiverSocketId(user.id);
        if (receiverId) {
          io.to(receiverId).emit("newViewer", {
            viewer: {
              viewerUser,
            },
          });
        }

        const notification = Notification.create({
          fromUser: viewerUser,
          toUser: user,
          title: "New Profile View",
          message: `${viewerUser.username} viewed your profile.`,
          type: NotificationType.profileView,
        });

        await notification.save();

        if (receiverId) {
          io.to(receiverId).emit("newNotification", { notification });
        }
      }
    }
    const notFollower = !user.following.some((f) => f.id === loggedInUserId);

    if (!user.isvisible && loggedInUserId !== id && notFollower) {
      user.tweets = [];
      visible = false;
    }

    const { password, ...safeUser } = user;

    res.status(200).json({
      message: "User profile retrieved successfully",
      success: true,
      data: safeUser,
      isvisible: visible,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const followAndUnfollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = Number(req.params.id);

    if (user?.id === id) {
      return next(new appError("You cannot follow/unfollow yourself", 400));
    }

    const existUser = await User.findOne({
      where: { id: user.id },
      relations: ["following"],
    });

    const targetUser = await User.findOne({
      where: { id },
      relations: ["followers"],
    });

    if (!existUser || !targetUser) {
      return next(new appError("User not found", 404));
    }

    const isFollowing = existUser.following.some((u) => u.id === id);

    if (isFollowing) {
      existUser.following = existUser.following.filter((u) => u.id !== id);
      targetUser.followers = targetUser.followers.filter(
        (u) => u.id !== user.id
      );
    } else {
      existUser.following.push(targetUser);
      targetUser.followers.push(existUser);
    }

    await existUser.save();
    await targetUser.save();

    io.emit("followOrUnfollow", {
      existUserId: existUser.id,
      targetUserId: targetUser.id,
      followStatus: !isFollowing,
    });

    if (!isFollowing && existUser.id !== targetUser.id) {
      if (!targetUser || !existUser) return;

      const notification = new Notification();
      notification.fromUser = existUser;
      notification.toUser = targetUser;
      notification.title = "New Follower";
      notification.message = `${existUser.username} started following you`;
      notification.type = NotificationType.follow;

      try {
        await notification.save();
      } catch (err) {
        console.error("Notification save error:", err);
      }

      const safeNotificationPayload = {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        createdAt: notification.createdAt,
        toUser: {
          id: targetUser.id,
        },
        fromUser: {
          id: existUser.id,
          username: existUser.username,
          profil_picture: existUser.profil_picture,
        },
      };

      const receiverId = getReceiverSocketId(targetUser?.id);

      if (receiverId) {
        io.to(receiverId).emit("newNotification", {
          notification: safeNotificationPayload,
        });
      }
    }

    res.status(200).json({
      success: true,
      follow: !isFollowing,
      message: isFollowing
        ? "Unfollowed successfully"
        : "Followed successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { page, limit } = req.body;
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    const user = req.user;

    const existUser = await User.findOne({
      where: { id: user.id },
      relations: ["following"],
    });

    if (!existUser) {
      return next(new appError("User not found", 404));
    }

    const followingIds = existUser.following?.map((u) => u.id) || [];

    let query = User.createQueryBuilder("user")
      .leftJoinAndSelect("user.tweets", "tweets")
      .leftJoinAndSelect("user.followers", "followers")
      .leftJoinAndSelect("user.following", "following")
      .where("user.id != :id", { id: user.id });

    if (followingIds.length > 0) {
      query = query.andWhere("user.id NOT IN (:...followingIds)", {
        followingIds,
      });
    }

    const [totalUsers, suggestions] = await Promise.all([
      query.getCount(),
      query.orderBy("RAND()").skip(skip).take(limit).getMany(),
    ]);

    res.status(200).json({
      success: true,
      message: "Suggestions retrieved successfully",
      data: suggestions,
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const searchUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { username } = req.params;

    if (!username || !user) {
      return next(new appError("invalid parametr", 400));
    }

    const existUsers = await User.createQueryBuilder("user")
      .leftJoinAndSelect("user.following", "following")
      .leftJoinAndSelect("user.followers", "followers")
      .leftJoinAndSelect("user.tweets", "tweets")
      .leftJoinAndSelect("tweets.comments", "comments")
      .leftJoinAndSelect("user.bookmarks", "bookmarks")
      .leftJoinAndSelect("user.likedTweet", "likedTweet")
      .where("user.id != :id", { id: user.id })
      .andWhere("user.username LIKE :username", { username: `%${username}%` })
      .getMany();

    res.status(200).json({ success: true, data: existUsers });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const {
      email,
      username,
      gender,
      currentPassword,
      newPassword,
      bio,
      isvisible,
    } = req.body;

    const files = req.files as any;
    const imageUrl = files?.imageUrl?.[0]?.path || "";
    const coverUrl = files?.coverUrl?.[0]?.path || "";

    const existUser = await User.findOne({ where: { id } });
    if (!existUser) {
      return next(new appError("User not found", 404));
    }

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return next(
          new appError("Both current and new passwords are required", 400)
        );
      }
      if (currentPassword === newPassword) {
        return next(
          new appError(
            "New password should be different from the current one",
            400
          )
        );
      }
      const isMatch = await bcrypt.compare(currentPassword, existUser.password);
      if (!isMatch) {
        return next(new appError("Current password is incorrect", 400));
      }
      existUser.password = await bcrypt.hash(newPassword, 10);
    }

    if (gender && !Object.values(Gender).includes(gender)) {
      return next(new appError("Invalid gender value", 400));
    }

    if (email && email !== existUser.email) {
      const existEmail = await User.findOne({ where: { email } });
      if (existEmail) {
        return next(new appError("Email already exists", 400));
      }
    }

    Object.assign(existUser, {
      email: email || existUser.email,
      username: username || existUser.username,
      bio: bio || existUser.bio,
      gender: gender || existUser.gender,
      profil_picture: imageUrl || existUser.profil_picture,
      cover_picture: coverUrl || existUser.cover_picture,
      isvisible: isvisible || existUser.isvisible,
    });

    await existUser.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: existUser,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const userController = () => {
  return {
    getProfile,
    followAndUnfollowUser,
    updateUser,
    getSuggestions,
    searchUser,
  };
};
