import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let pendingConnection = null;

export const connectDB = async () => {
  try {
    // If already connected, return the existing connection
    if (mongoose.connection.readyState === 1) return mongoose.connection;

    // If a connection is already in progress, return the same promise
    if (pendingConnection) return await pendingConnection;

    // Start connection and cache the promise so concurrent callers join
    pendingConnection = mongoose.connect(process.env.MONGO_URL);

    try {
      const conn = await pendingConnection;
      console.log("Connected to MongoDB");
      return conn;
    } catch (err) {
      // Reset promise on failure so future attempts can retry
      pendingConnection = null;
      console.log("MONGO_URL =", process.env.MONGO_URL);
      console.log("Error connecting to MongoDB:", err);
      throw err;
    }
  } catch (error) {
    console.log("MONGO_URL =", process.env.MONGO_URL);
    console.log("Error connecting to MongoDB:", error);
  }
};
