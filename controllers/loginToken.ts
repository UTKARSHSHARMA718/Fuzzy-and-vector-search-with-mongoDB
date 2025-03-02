import type { Request, Response } from "express";
import LoginToken from "../models/loginToken";

export class LoginTokenHandler {
  static async createLoginToken(req: Request, res: Response) {
    const { token, userId } = req.body;
    try {
      const newLoginToken = new LoginToken({ token, userId });
      await newLoginToken.save();
      res.status(201).send(newLoginToken);
    } catch (error) {
      res.status(400).send(error);
    }
  }
}
