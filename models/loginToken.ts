import mongoose from "mongoose";

const LoginTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Create TTL index on `createdAt` with a 1-hour expiration time (3600 seconds)
LoginTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const LoginToken = mongoose.model("LoginToken", LoginTokenSchema);

export default LoginToken;
