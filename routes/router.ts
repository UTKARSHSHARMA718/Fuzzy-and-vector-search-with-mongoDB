import express from "express";
import { bookRouter } from "./book";
import { loginTokenRouter } from "./loginToken";

const Router = express.Router();

Router.use("/book", bookRouter);
Router.use("/login/token", loginTokenRouter);

export default Router;
