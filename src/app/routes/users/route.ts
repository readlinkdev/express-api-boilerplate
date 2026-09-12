import type { Express, Request, Response } from "express";

export const prefix = "/users";

export default function registerRoute(app: Express) {
  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: [{}]
    });
  });
}
