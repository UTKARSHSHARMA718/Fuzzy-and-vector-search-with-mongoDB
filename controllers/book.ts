import type { Request, Response } from "express";
import Book from "../models/book";
import { createEmbeddings } from "../services/vectorSearch";

export class BookHandler {
  static async createBook(req: Request, res: Response) {
    try {
      // NOTE: skipping input validation
      const { name, price, author, copiesSold, description } = req.body;
      const bookDescriptionEmbedding = await createEmbeddings(description);

      const newBook = new Book({
        name,
        price,
        author,
        copies_sold: copiesSold,
        description,
        embedding: bookDescriptionEmbedding,
      });

      const savedBook = await newBook.save();

      res.status(201).json({
        message: "Book created successfully",
        data: savedBook,
      });
    } catch (error) {
      console.log({ error });
      res.status(500).json({
        message: "Something went wrong",
        data: null,
      });
    }
  }

  static async searchBooks(req: Request, res: Response) {
    try {
      const { query } = req.query;
      const queryEmbedding = (await createEmbeddings(
        query as string
      )) as number[];

      const similarDocuments = await Book.aggregate([
        {
          $vectorSearch: {
            queryVector: queryEmbedding,
            path: "embedding",
            index: "description_vector_search",
            numCandidates: 100,
            limit: 5,
          },
        },
        {
          $project: {
            description: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ]);

      res.status(200).json({
        message: "Books fetched successfully",
        data: similarDocuments,
      });
    } catch (error) {
      console.log({ error });
      res.status(500).json({
        message: "Something went wrong",
        data: null,
      });
    }
  }

  static async searchBooksFuzzy(req: Request, res: Response) {
    try {
      const { query } = req.query;
      const users = await Book.aggregate([
        {
          $search: {
            index: "description_search",
            text: {
              query: query as string,
              path: "description",
              fuzzy: {
                maxEdits: 2,
                prefixLength: 0
              }
            },
          },
        },
        {
          $limit: 10,
        },
      ]);
      console.log({ users, query });
      res.status(200).json({
        message: "Books fetched successfully",
        data: users,
      });
    } catch (error) {
      console.log({ error });
      res.status(500).json({
        message: "Something went wrong",
        data: null,
      });
    }
  }
}
