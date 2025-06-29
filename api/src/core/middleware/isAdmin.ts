import { NextFunction, Request, Response } from "express";
import { appError } from "../error/appError";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "ADMIN") {
    return next();
  }

  return next(new appError("Admins only.", 403));
};
export default adminMiddleware;
