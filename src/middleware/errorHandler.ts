import { Request, Response } from "express";
import { ChatsApiError } from "../utils";

export function errorHandler(error: ChatsApiError | Error, req: Request, res: Response, next: Function): Response | unknown {
  if (res.headersSent) {
    return next(error);
  }

  const errorCode = error instanceof ChatsApiError ? error.code : 500;

  return res.status(errorCode).json({
    error: error.message
  });
}
