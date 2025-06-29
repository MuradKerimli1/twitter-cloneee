import { NextFunction, Request, Response } from "express";
import { appError } from "../error/appError";

const premiumMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.user &&
    req.user.isPremium &&
    req.user.premiumExpiredAt > new Date()
  ) {
    return next();
  }

  return next(new appError("Premium access expired or not available.", 403));
};

export default premiumMiddleware;
