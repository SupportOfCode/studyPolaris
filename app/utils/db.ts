import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
