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
const port = process.env.PORT;

AppDataSource.initialize()
  .then(() => {
    console.log("mysql connected");

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
        message: err.message || "internal server error",
      });
    });

    server.listen(port, () => {
      console.log(`server running port - ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
