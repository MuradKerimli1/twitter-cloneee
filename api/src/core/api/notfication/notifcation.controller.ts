import { NextFunction, Request, Response } from "express";
import { Notification } from "../../../dal/entity/notfication.entity";
import { appError } from "../../error/appError";

const getNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new appError("invalid parametr", 400));
    }

    const notfications = await Notification.createQueryBuilder("notification")
      .leftJoinAndSelect("notification.fromUser", "fromUser")
      .leftJoinAndSelect("notification.toUser", "toUser")
      .where("notification.toUserId = :userId", { userId })
      .orderBy("notification.createdAt", "DESC")
      .getMany();

    res.status(200).json({
      status: "success",
      data: notfications,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new appError("invalid parameter", 400));
    }

    const result = await Notification.createQueryBuilder("notification")
      .where("notification.toUserId = :userId", { userId })
      .delete()
      .execute();

    if (result.affected === 0) {
      return next(new appError("notification not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteNotificationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const notificationId = Number(req.params.id);

    if (!userId || !notificationId) {
      return next(new appError("invalid parameter", 400));
    }

    const result = await Notification.createQueryBuilder("notification")
      .leftJoinAndSelect("notification.fromUser", "fromUser")
      .leftJoinAndSelect("notification.toUser", "toUser")
      .where("notification.id = :notificationId", { notificationId })
      .andWhere("toUser.id = :userId", { userId })
      .delete()
      .execute();

    if (result.affected === 0) {
      return next(new appError("notification not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const notficationController = () => {
  return { getNotification, deleteNotification, deleteNotificationById };
};
