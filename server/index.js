import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
import { connectDB } from "./connection.js";
import auctionRouter from "./routes/auction.js";
import { secureRoute } from "./middleware/auth.js";
import userAuthRouter from "./routes/userAuth.js";
import userRouter from "./routes/user.js";
import contactRouter from "./routes/contact.js";
import adminRouter from "./routes/admin.js";
import notificationRouter from "./routes/notification.js";
import { startAuctionScheduler } from "./services/auctionScheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 4000;

connectDB();

const app = express();
app.use(cookieParser());
app.use(express.json());
const allowedOrigins = process.env.ORIGINS
  ? process.env.ORIGINS.split(",")
  : process.env.ORIGIN
    ? [process.env.ORIGIN]
    : ["http://localhost:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", async (req, res) => {
  res.json({ msg: "Welcome to Online Auction System API" });
});
app.use("/auth", userAuthRouter);
app.use("/user", secureRoute, userRouter);
app.use("/auction", secureRoute, auctionRouter);
app.use("/contact", contactRouter);
app.use("/admin", secureRoute, adminRouter);
app.use("/notifications", secureRoute, notificationRouter);

// Khởi động auction scheduler
startAuctionScheduler();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
