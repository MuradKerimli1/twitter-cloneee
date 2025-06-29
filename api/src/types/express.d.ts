import { User } from "../dal/entity/user.entity";

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
