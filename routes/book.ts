import express from "express";
import { BookHandler } from "../controllers/book";

export const bookRouter = express.Router();

bookRouter.post("/", BookHandler.createBook);
bookRouter.get("/vector/query", BookHandler.searchBooks);
bookRouter.get("/fuzzy/query", BookHandler.searchBooksFuzzy);
