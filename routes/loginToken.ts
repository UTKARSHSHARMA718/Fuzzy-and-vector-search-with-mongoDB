import express from "express";
import { LoginTokenHandler } from "../controllers/loginToken";

export const loginTokenRouter = express.Router();

loginTokenRouter.post("/", LoginTokenHandler.createLoginToken);
