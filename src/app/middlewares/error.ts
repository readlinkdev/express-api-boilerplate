import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";

export const errorMiddleware: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
