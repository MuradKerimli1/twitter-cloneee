import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { appError } from "../../core/error/appError";
import { Socket } from "socket.io";
import { User } from "../../dal/entity/user.entity";

export const socketAuth = async (
  socket: Socket & { user?: User },
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      throw new appError("No token provided", 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_SECRET_KEY!
    ) as JwtPayload;

    if (!decoded.sub) {
      throw new appError("Invalid token payload", 401);
    }

    const user = await User.findOne({
      where: { id: parseInt(decoded.sub) },
    });

    if (!user) {
      throw new appError("User not found", 404);
    }

    socket.user = user;

    next();
  } catch (err: any) {
    next(err);
  }
};
