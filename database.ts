import mongoose from "mongoose";

export const initDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL!, {
      autoIndex: true,
    });
    return connection;
  } catch (error) {
    console.log({ error });
  }
};
