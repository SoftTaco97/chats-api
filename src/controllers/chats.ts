import { Request, Response } from "express";
import { Chat, User } from "../models";
import { ChatsApiError } from "../utils";
import { Op } from "sequelize";

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

      const chat = await Chat.findOne({
        where: {
          id,
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

      const currentTime = new Date();

      const user = await User.findOne({
        where: {
          username,
        },
        attributes: ['id'],
        include: [{
          model: Chat,
          attributes: ['id', 'text'],
          where: {
            expiration_date: {
              [Op.gte]: currentTime,
            }
          },
          required: false,
        }]
      });

      if (!user) {
        throw new ChatsApiError('No user found for username', 404);
      }

      const chatsForUser = user.Chats.map(({ id, text }) => ({
        id,
        text,
      }));

      // Update the expiration date to hide the chats that have been seen by the user
      await Chat.update({
        expiration_date: currentTime,
      }, {
        where: {
          id: chatsForUser.map(({ id }) => id),
        }
      });

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
        user_id: user.id,
        expiration_date: expirationDate,
      });

      return res.status(201).json({
        id: chat.id
      });
    } catch (err) {
      return next(err);
    }
  }
}
