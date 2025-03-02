# Fuzzy Search

Step 1: Ensure Your Atlas Search Index is Correctly Set Up
First, make sure your text index is specifically an Atlas Search index (not a regular MongoDB text index):

- Go to your MongoDB Atlas dashboard
- Select your cluster
- Go to "Search" tab in search index of atlas search
- Create a new index with the following settings:

Select JSON editor and use this configuration:

```
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "description": {
        "type": "string",
        "analyzer": "lucene.standard"
      }
    }
  }
}
```
- Give your index a name (e.g., "book-search")

Step 2: Fix Your Query Code
Your current query has a few issues. Here's the corrected version:

```
static async searchBooksFuzzy(req: Request, res: Response) {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        message: "Query parameter is required and must be a string",
        data: null
      });
    }

    const books = await Book.aggregate([
      {
        $search: {
          index: "book-search", // Use your index name here
          text: {
            query: query, // Use the query from request, not hardcoded "about"
            path: "description",
            fuzzy: {
              maxEdits: 2,
              prefixLength: 0
            }
          }
        }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      message: "Books fetched successfully",
      data: books
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({
      message: "Something went wrong",
      data: null
    });
  }
}
```

### Some points to remember

- Added the index name (use your actual index name)
- Using the query parameter from request instead of hardcoded "about"
- Added fuzzy search options (maxEdits, prefixLength)
- Changed variable name from "users" to "books" for clarity

---

# Vector Search

Step 1: Set Up Vector Search Index in MongoDB Atlas
First, you need to create a proper vector search index in MongoDB Atlas:

- Go to your MongoDB Atlas dashboard
- Select your cluster
- Go to the "Search" tab in search index of atlas search
- Click "Create Index"
- Select "JSON Editor" and use this configuration:

```
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "embedding": {
        "dimensions": 384,
        "similarity": "cosine",
        "type": "knnVector"
      }
    }
  }
}
```

### Note: 384 is the dimension for the MiniLM-L6-v2 model you're using. Make sure this matches your actual vector dimensions.

- Name your index (e.g., "vector-search-index")

Step 2: Fix Your Schema to Support Vector Data
- Ensure your Book model schema properly defines the embedding field:

```
// Book.ts model
import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  author: { type: String, required: true },
  copies_sold: { type: Number, default: 0 },
  description: { type: String, required: true },
  embedding: { type: [Number], required: true, index: false }
});

const Book = mongoose.model('Book', BookSchema);
export default Book;
```

Step 3: Fix the Embedding Generation Function
- Your embedding function looks good, but let's ensure we handle errors properly:

```
import { pipeline } from "@xenova/transformers";

export const createEmbeddings = async (text: string): Promise<number[] | null> {
  try {
    if (!text || typeof text !== 'string') {
      console.log("Invalid text input for embedding");
      return null;
    }
    
    const embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    const response = await embedder([text], {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(response.data);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return null;
  }
};
```

Step 4: Fix Your Vector Search Query
- Now let's correct your searchBooks function:

```
static async searchBooks(req: Request, res: Response) {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        message: "Query parameter is required and must be a string",
        data: null
      });
    }
    
    const queryEmbedding = await createEmbeddings(query);
    
    if (!queryEmbedding) {
      return res.status(400).json({
        message: "Failed to generate embeddings for query",
        data: null
      });
    }

    console.log(`Searching with query: "${query}"`);
    
    const similarDocuments = await Book.aggregate([
      {
        $vectorSearch: {
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 100,  // Increased for better recall
          limit: 5,
          index: "vector-search-index"  // Use your actual index name here
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          author: 1,
          description: 1,
          price: 1,
          copies_sold: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    res.status(200).json({
      message: "Books fetched successfully",
      data: similarDocuments
    });
  } catch (error) {
    console.error("Vector search error:", error);
    res.status(500).json({
      message: "Something went wrong during vector search",
      data: null
    });
  }
}
```