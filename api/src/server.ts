// main.ts (və ya server.ts)
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import { AppDataSource } from "./dal/db/mysql";
import cookieParser from "cookie-parser";
import cors from "cors";
import { mainRouter } from "./core/router/router";
import { initializeSocket } from "./socket/socket";
import {
  startPremiumStatusCheckerJob,
  startViewerCleanupJob,
} from "./core/cron/cron";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ MySQL bağlantısı quruldu");

    initializeSocket(server);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(
      cors({
        origin: process.env.FRONT_END_URL,
        credentials: true,
      })
    );

    startViewerCleanupJob();
    startPremiumStatusCheckerJob();

    app.use("/api/v1", mainRouter);

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      res.status(err.status || 500).json({
        message: err.message || "Internal server error",
      });
    });

    server.listen(port, () => {
      console.log(`🚀 Server port ${port}-da işə düşdü`);
    });
  })
  .catch((err) => {
    console.error("❌ MySQL bağlantı xətası:", err);
    process.exit(1);
  });
