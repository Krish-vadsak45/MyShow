import mongoose from "mongoose";
import logger from "./logger.js";

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  try {
    if (mongoose.connection.listenerCount("connected") === 0) {
      mongoose.connection.on("connected", () => logger.info("Database connected"));
    }

    connectionPromise = mongoose.connect(`${process.env.MONGODB_URI}/myShow`, {
      maxPoolSize: 30,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    return await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    logger.error({ err: error }, "MongoDB connection failed");
    throw error;
  }
};

export default connectDB;
