import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => logger.info("Database connected"));
    await mongoose.connect(`${process.env.MONGODB_URI}/myShow`, {
      maxPoolSize: 30,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
  } catch (error) {
    logger.error({ err: error }, "MongoDB connection failed");
    process.exit(1);
  }
};

export default connectDB;
