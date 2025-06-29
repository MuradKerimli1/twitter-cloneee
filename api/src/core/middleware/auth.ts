import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { appError } from "../error/appError";
import { User } from "../../dal/entity/user.entity";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new appError("Invalid token", 401));
    }

    const decode = jwt.verify(
      token,
      process.env.ACCESS_SECRET_KEY!
    ) as jwt.JwtPayload;

    if (!decode || typeof decode !== "object" || !decode.sub) {
      return next(new appError("Invalid token payload", 401));
    }

    const userId = parseInt(decode.sub);
    if (isNaN(userId)) {
      return next(new appError("Invalid token payload", 401));
    }

    const existUser = await User.findOne({ where: { id: userId } });

    if (!existUser) {
      return next(new appError("User not found", 404));
    }
    if (existUser.isBlocked) {
      return next(new appError("Your account is blocked", 403));
    }

    req.user = existUser;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new appError("JWT expired", 401));
    }
    console.error("Error during authentication:", error);
    next(new appError("Internal server error", 500));
  }
};
