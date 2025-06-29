import cron from "node-cron";
import { User } from "../../dal/entity/user.entity";
import { LessThan } from "typeorm";
import io, { getReceiverSocketId } from "../../socket/socket";

export const startViewerCleanupJob = () => {
  cron.schedule("0 0 1 * *", async () => {
    try {
      const users = await User.find({ relations: ["viewers"] });

      for (const user of users) {
        if (user.viewers.length > 0) {
          user.viewers = [];
          await user.save();
        }
      }

      io.emit("viewersCleanedUp", {
        message: "Bütün istifadəçilərin viewer-ləri silindi.",
      });
      console.log("Bütün istifadəçilərin viewer-ləri silindi.");
    } catch (err) {
      console.error("Viewer cleanup zamanı xəta baş verdi:", err);
    }
  });
};

export const startPremiumStatusCheckerJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const expiredPremiumUsers = await User.find({
        where: {
          isPremium: true,
          premiumExpiredAt: LessThan(now),
        },
      });

      for (const user of expiredPremiumUsers) {
        user.isPremium = false;
        user.premiumExpiredAt = null as any;
        user.viewers = [];
        await user.save();
        const socketId = getReceiverSocketId(user.id);
        if (socketId) {
          io.to(socketId).emit("premiumStatusExpired", {
            message: "Sizin premium statusunuz sona çatıb.",
            isPremium: false,
            userId: user.id,
          });
        }
      }
    } catch (err) {
      console.error("❌ Premium status check zamanı xəta baş verdi:", err);
    }
  });
};
