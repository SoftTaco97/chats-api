import { Request, Response } from "express";
import crypto from 'crypto';
import { Chat, User } from "../models";
import { ChatsApiError } from "../utils";

export class ChatsController {
  /**
   * Controller for GET requests to /chats
   */
  public static getChats(req: Request, res: Response, next: Function): Promise<Response> {
    if (req.query.id) {
      return ChatsController.getChatForId(req, res, next);
    }

    if (req.query.username) {
      return ChatsController.getChatsForUsername(req, res, next);
    }

    return next(new ChatsApiError('Please provide a chat id or a username', 400));
  }

  /**
   * Controller for GET requests to /chats?id={id}
   */
  public static async getChatForId(req: Request, res: Response, next: Function): Promise <Response> {
    try {
      const { id } = req.query;
      
      if (typeof id !== 'string') {
        throw new ChatsApiError('"id" must be string', 400);
      }

      const chat = await Chat.findOne({
        where: {
          uuid: id,
        },
        attributes: ['expiration_date', 'text'],
        include: [{
          model: User,
          attributes: ['username']
        }]
      });

      if (!chat) {
        throw new ChatsApiError('No chat found for chat id', 404);
      }

      return res.status(200).json({
        username: chat.User.username,
        text: chat.text,
        expiration_date: chat.expiration_date,
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Controller for GET requests to /chats?username={username}
   */
  public static async getChatsForUsername(req: Request, res: Response, next: Function): Promise <Response> {
    try {
      const { username } = req.query;

      if (typeof username !== 'string') {
        throw new ChatsApiError('"username" must be string', 400);
      }

      const user = await User.findOne({
        where: {
          username,
        },
        attributes: ['id'],
        include: [{
          model: Chat,
          attributes: ['uuid', 'text']
        }]
      });

      if (!user) {
        throw new ChatsApiError('No user found for username', 404);
      }

      const chatsForUser = user.Chats.map(({ uuid, text }) => ({
        id: uuid,
        text,
      }));

      return res.status(200).json(chatsForUser);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Controller for POST requests to /chats/
   */
  public static async addChatMessage(req: Request, res: Response, next: Function): Promise <Response> {
    try {
      const { username, text } = req.body;

      if (!username || !text) {
        const errorMessage = username ? 'Missing required field: "text"' : 'Missing required field: "username"';
        throw new ChatsApiError(errorMessage, 400);
      }

      const [user] = await User.findOrCreate({
        where: {
          username,
        },
        attributes: ['id']
      });

      const currentTime = new Date();
      const timeout = req.body.timeout || 60;
      const expirationDate = currentTime.setSeconds(currentTime.getSeconds() + timeout);

      const chat = await Chat.create({
        text,
        uuid: crypto.randomUUID(),
        user_id: user.id,
        expiration_date: expirationDate,
      });

      return res.status(200).json({
        id: chat.uuid
      });
    } catch (err) {
      return next(err);
    }
  }
}
