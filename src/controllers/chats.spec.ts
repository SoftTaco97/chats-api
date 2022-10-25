import { Request, Response } from "express";
import { Chat, User } from "../models";
import { ChatsApiError } from "../utils";
import { ChatsController } from "./chats";
import { Op } from "sequelize";

describe('src/controllers/chats.ts', () => {
  describe('ChatsController', () => {
    const mockNext = jest.fn();
    let mockRes: Response;

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2020-12-12'));
    });

    beforeEach(() => {
     mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;
    });

    afterAll(jest.useRealTimers);

    describe('getChats', () => {
      let mockReq: Request;

      beforeEach(() => {
        jest.spyOn(ChatsController, 'getChatForId').mockResolvedValue(mockRes);
        jest.spyOn(ChatsController, 'getChatsForUsername').mockResolvedValue(mockRes);

        mockReq = {
          query: {}
        } as unknown as Request;
      });

      it('Should use ChatsController.getChatForId when there is an id in the query', async () => {
        mockReq.query.id = 'test';

        await ChatsController.getChats(mockReq, mockRes, mockNext);

        expect(ChatsController.getChatForId).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        expect(ChatsController.getChatsForUsername).not.toHaveBeenCalled();
      });

      it('Should use ChatsController.getChatsForUsername when there is a username in the query', async () => {
        mockReq.query.username = 'test';

        await ChatsController.getChats(mockReq, mockRes, mockNext);

        expect(ChatsController.getChatsForUsername).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        expect(ChatsController.getChatForId).not.toHaveBeenCalled();
      });

      it('Should call next when a ChatsApiError when there is no username or id in the query', async () => {
        await ChatsController.getChats(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new ChatsApiError('Please provide a chat id or a username', 400));
        expect(ChatsController.getChatsForUsername).not.toHaveBeenCalled();
        expect(ChatsController.getChatForId).not.toHaveBeenCalled();
      });
    });

    describe('getChatForId', () => {
      let mockReq: Request;

      beforeEach(() => {
        mockReq = {
          query: {
            id: '1',
          }
        } as unknown as Request;

        jest.spyOn(Chat, 'findOne').mockResolvedValue(null);
      });

      it('Should throw when there is no chat for the id provided', async () => {
        await ChatsController.getChatForId(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new ChatsApiError('No chat found for chat id', 404));
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });

      it('Should respond with the chat information', async () => {
        const mockChatEntry = {
          text: 'test-text',
          expiration_date: 'testing',
          User: {
            username: 'test-user'
          }
        };

        (Chat.findOne as jest.Mock).mockResolvedValue(mockChatEntry);

        await ChatsController.getChatForId(mockReq, mockRes, mockNext);

        expect(Chat.findOne).toHaveBeenCalledWith({
          where: {
            id: mockReq.query.id,
          },
          attributes: ['expiration_date', 'text'],
          include: [{
            model: User,
            attributes: ['username']
          }]
        });

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          username: mockChatEntry.User.username,
          text: mockChatEntry.text,
          expiration_date: mockChatEntry.expiration_date,
        });
      });

      it('Should handle errors', async () => {
        const mockError = new Error('test');

        (Chat.findOne as jest.Mock).mockRejectedValue(mockError);

        await ChatsController.getChatForId(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(mockError);
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });
    });

    describe('getChatsForUsername', () => {
      let mockReq: Request;

      beforeEach(() => {
        mockReq = {
          query: {
            username: 'test',
          }
        } as unknown as Request;

        jest.spyOn(User, 'findOne').mockResolvedValue(null);
        jest.spyOn(Chat, 'update').mockResolvedValue([0]);
      });

      it('Should throw when there is no user for the username provided', async () => {
        await ChatsController.getChatsForUsername(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new ChatsApiError('No user found for username', 404));
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });

      it('Should respond with the user\'s chat information', async () => {
        const mockUserWithChats = {
          id: 'test-id',
            Chats: [{
            id: 'testing',
            text: 'test-text',
          }]
        };

        (User.findOne as jest.Mock).mockResolvedValue(mockUserWithChats);

        await ChatsController.getChatsForUsername(mockReq, mockRes, mockNext);

        expect(User.findOne).toHaveBeenCalledWith({
          where: {
            username: mockReq.query.username,
          },
          attributes: ['id'],
          include: [{
            model: Chat,
            attributes: ['id', 'text'],
            where: {
              expiration_date: {
                [Op.gte]: new Date(),
              }
            },
            required: false,
          }]
        });

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith([{
          id: mockUserWithChats.Chats[0].id,
          text: mockUserWithChats.Chats[0].text,
        }]);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('Should expire the user\'s chats', async () => {
        const mockUserWithChats = {
          id: 'test-id',
            Chats: [{
            id: 'testing',
            text: 'test-text',
          }]
        };

        (User.findOne as jest.Mock).mockResolvedValue(mockUserWithChats);

        await ChatsController.getChatsForUsername(mockReq, mockRes, mockNext);

        expect(Chat.update).toHaveBeenCalledWith(
          {
          expiration_date: new Date(),
          },
          {
            where: {
              id: [mockUserWithChats.Chats[0].id],
            },
          }
        );

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith([{
          id: mockUserWithChats.Chats[0].id,
          text: mockUserWithChats.Chats[0].text,
        }]);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('Should handle errors', async () => {
        const mockErr = new Error('test');

        (User.findOne as jest.Mock).mockRejectedValue(mockErr);

        await ChatsController.getChatsForUsername(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(mockErr);
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });
    });

    describe('addChatMessage', () => {
      let mockReq: Request;

      beforeEach(() => {
        mockReq = {
          body: {
            username: 'test',
            text: 'testing-text'
          }
        } as unknown as Request;

        jest.spyOn(User, 'findOrCreate').mockResolvedValue([{} as unknown as User, true]);
        jest.spyOn(Chat, 'create').mockResolvedValue(null);
      });

      it('Should throw when a username is not provided', async () => {
        delete mockReq.body.username;

        await ChatsController.addChatMessage(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new ChatsApiError('Missing required field: "username"', 400));
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });

      it('Should throw when text is not provided', async () => {
        delete mockReq.body.text;

        await ChatsController.addChatMessage(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new ChatsApiError('Missing required field: "text"', 400));
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });

      it('Should set the expiration_date using the timeout field', async () => {
        mockReq.body.timeout = 50;
        const mockUser = {
          id: 'userId'
        } as unknown as User;
        const mockChat = {
          id: 'test-id'
        } as unknown as Chat;

        (User.findOrCreate as jest.Mock).mockResolvedValue([mockUser]);
        (Chat.create as jest.Mock).mockResolvedValue(mockChat);

        await ChatsController.addChatMessage(mockReq, mockRes, mockNext);

        const currentTime = new Date();
        expect(Chat.create).toHaveBeenCalledWith(expect.objectContaining({
          expiration_date: currentTime.setSeconds(currentTime.getSeconds() + mockReq.body.timeout),
        }));
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
          id: mockChat.id,
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('Should default the expiration_date to be 60 seconds from now', async () => {
        const mockUser = {
          id: 'userId'
        } as unknown as User;
        const mockChat = {
          id: 'test-id'
        } as unknown as Chat;

        (User.findOrCreate as jest.Mock).mockResolvedValue([mockUser]);
        (Chat.create as jest.Mock).mockResolvedValue(mockChat);

        await ChatsController.addChatMessage(mockReq, mockRes, mockNext);

        const currentTime = new Date();
        expect(Chat.create).toHaveBeenCalledWith(expect.objectContaining({
          expiration_date: currentTime.setSeconds(currentTime.getSeconds() + 60),
        }));
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
          id: mockChat.id,
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('Should store the chat for the user', async () => {
        const mockUser = {
          id: 'userId'
        } as unknown as User;
        const mockChat = {
          id: 'test-id'
        } as unknown as Chat;

        (User.findOrCreate as jest.Mock).mockResolvedValue([mockUser]);
        (Chat.create as jest.Mock).mockResolvedValue(mockChat);

        await ChatsController.addChatMessage(mockReq, mockRes, mockNext);

        expect(Chat.create).toHaveBeenCalledWith(expect.objectContaining({
          text: mockReq.body.text,
          user_id: mockUser.id,
        }));
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
          id: mockChat.id,
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('Should handle errors', async () => {
        const mockError = new Error('test');

        (User.findOrCreate as jest.Mock).mockRejectedValue(mockError);

        await ChatsController.addChatMessage(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(mockError);
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });
    });
  });
});
