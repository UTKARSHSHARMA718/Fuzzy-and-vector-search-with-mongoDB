import { pipeline } from "@xenova/transformers";

export const createEmbeddings = async (text: string) => {
  try {
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
    console.log({ error });
  }
};
