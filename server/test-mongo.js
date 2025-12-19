import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGO_URL;
console.log("MONGO_URL=", url);

(async () => {
  try {
    await mongoose.connect(url, {
      dbName: "auctiondb",
      serverSelectionTimeoutMS: 15000,
    });
    console.log("Mongoose connected successfully");
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Mongoose connect error:");
    console.error(err);
    process.exit(1);
  }
})();
