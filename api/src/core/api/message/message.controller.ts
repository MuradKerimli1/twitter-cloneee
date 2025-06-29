import { NextFunction, Request, Response } from "express";
import { appError } from "../../error/appError";
import { Conversation } from "../../../dal/entity/conversation.entity";
import { User } from "../../../dal/entity/user.entity";
import { Message } from "../../../dal/entity/message.entity";
import { AppDataSource } from "../../../dal/db/mysql";
import io, { getReceiverSocketId } from "../../../socket/socket";

const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user.id;
    const receiverId = Number(req.params.id);
    const { text } = req.body;

    if (!text || !receiverId || !senderId) {
      return next(new appError("Invalid parameters", 400));
    }

    const [sender, receiver] = await Promise.all([
      User.findOne({ where: { id: senderId } }),
      User.findOne({ where: { id: receiverId } }),
    ]);

    if (!sender || !receiver) {
      return next(new appError("User not found", 404));
    }

    let conversation = await AppDataSource.getRepository(Conversation)
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.participants", "participant")
      .where(
        "conversation.id IN " +
          "(SELECT conversationId FROM conversation_participants_user WHERE userId IN (:...ids) " +
          "GROUP BY conversationId HAVING COUNT(userId) = 2)",
        { ids: [senderId, receiverId] }
      )
      .getOne();

    if (!conversation) {
      conversation = new Conversation();
      conversation.participants = [sender, receiver];
      await conversation.save();
      // socket
      const senderSocketId = getReceiverSocketId(sender.id);
      const receiverSocketId = getReceiverSocketId(receiver.id);

      if (senderSocketId) {
        io.to(senderSocketId).emit("newConversation", {
          conversation,
          otherUser: receiver,
        });
      }

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newConversation", {
          conversation,
          otherUser: sender,
        });
      }
    }

    const message = new Message();
    message.sender = sender;
    message.receiver = receiver;
    message.text = text;
    message.conversation = conversation;
    await message.save();

    const receiverIdSocket = getReceiverSocketId(message.receiver?.id);
    if (receiverIdSocket) {
      io.to(receiverIdSocket).emit("newMessage", {
        message,
      });
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

const getMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user.id;
    const receiverId = Number(req.params.id);

    if (!receiverId || !senderId) {
      return next(new appError("invalid parameters", 400));
    }

    const existUsers = await Promise.all([
      User.findOne({ where: { id: senderId } }),
      User.findOne({ where: { id: receiverId } }),
    ]);

    if (!existUsers[0] || !existUsers[1]) {
      return next(new appError("user not found", 404));
    }

    const existConversation = await AppDataSource.getRepository(Conversation)
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.participants", "participant")
      .leftJoinAndSelect("conversation.messages", "messages")
      .leftJoinAndSelect("messages.sender", "messagesauthor")

      .where(
        "conversation.id IN " +
          "(SELECT conversationId FROM conversation_participants_user WHERE userId IN (:...ids) " +
          "GROUP BY conversationId HAVING COUNT(userId) = 2)",
        { ids: [senderId, receiverId] }
      )
      .getOne();

    res.status(200).json({
      success: true,
      messages: existConversation?.messages || [],
    });
  } catch (error) {
    next(error);
  }
};

const getUserConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return next(new appError("User not found", 404));
    }

    const conversations = await AppDataSource.getRepository(Conversation)
      .createQueryBuilder("conversation")
      .innerJoinAndSelect("conversation.participants", "participants")
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select("conversation.id")
          .from(Conversation, "conversation")
          .innerJoin("conversation.participants", "user")
          .where("user.id = :userId")
          .getQuery();
        return "conversation.id IN " + subQuery;
      })
      .setParameter("userId", userId)
      .orderBy("conversation.updated_at", "DESC")
      .getMany();

    res.status(200).json({
      success: true,
      conversations: conversations || [],
    });
  } catch (error) {
    next(error);
  }
};

export const messageController = () => {
  return { sendMessage, getMessage, getUserConversations };
};
