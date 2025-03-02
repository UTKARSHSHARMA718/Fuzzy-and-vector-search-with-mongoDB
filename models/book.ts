import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    copies_sold: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
      index: false,
    },
  },
  { timestamps: true }
);

BookSchema.index(
  // @ts-ignore
  { embedding: "vectorSearch" },
  {
    vectorSearchOptions: {
      numDimensions: 768,
      similarity: "cosine",
    },
  }
);

const Book = mongoose.model("Book", BookSchema);

export default Book;
