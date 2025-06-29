// socket.ts
import { Server, Socket } from "socket.io";
import http from "http";
import { socketAuth } from "./middleware/socketAuth";

const userSocketMap: Record<string, string> = {};

export const getReceiverSocketId = (receiverId: number) => {
  return userSocketMap[receiverId];
};

let io: Server;

export const initializeSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONT_END_URL!,
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket: Socket & { user?: any }) => {
    console.log("Yeni socket qoşuldu:", socket.id);

    if (socket.user) {
      userSocketMap[socket.user.id] = socket.id;
      io.emit("onlineUsers", Object.keys(userSocketMap));
    }

    socket.on("disconnect", () => {
      if (socket.user) {
        delete userSocketMap[socket.user.id];
        io.emit("onlineUsers", Object.keys(userSocketMap));
      }
    });
  });

  return io;
};

export { io };
