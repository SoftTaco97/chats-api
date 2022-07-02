import { errorHandler } from "./errorHandler";
import { ChatsApiError } from "../utils";
import { Request, Response } from "express";

describe('src/middleware/errorHandler.ts', () => {
  describe('errorHandler', () => {
    const mockNext = jest.fn();
    const mockReq = ('request' as unknown) as Request;
    let mockRes: Response;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;
    });

    it('Should call the next function when the headers have been sent', () => {
      mockRes.headersSent = true;
      const mockErr = {} as Error;
      errorHandler(mockErr, mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockErr);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('Should use the code in the error when its a ChatsApiError', () => {
      const mockErr = new ChatsApiError('testing', 123);
      errorHandler(mockErr, mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(mockErr.code);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: mockErr.message
      });
    });

    it('Should default to a 500 status code when the error is not a ChatsApiError', () => {
      const mockErr = new Error('testing');
      errorHandler(mockErr, mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: mockErr.message
      });
    });
  });
});
