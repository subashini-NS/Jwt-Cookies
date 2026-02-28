import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/client.routes.js";

dotenv.config();

import "./models/index.js";

/* -------------------------------------------------------------------------- */
/*                              App Initialization                            */
/* -------------------------------------------------------------------------- */
const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------------------------------------------------------------- */
/*                             Trust Proxy (Prod)                              */
/* -------------------------------------------------------------------------- */
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/* -------------------------------------------------------------------------- */
/*                               Security Middlewares                          */
/* -------------------------------------------------------------------------- */
app.use(
  helmet({
    contentSecurityPolicy: false, // configure if needed
  }),
);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

/* -------------------------------------------------------------------------- */
/*                              Rate Limiting                                  */
/* -------------------------------------------------------------------------- */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);

/* -------------------------------------------------------------------------- */
/*                              Core Middlewares                               */
/* -------------------------------------------------------------------------- */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* -------------------------------------------------------------------------- */
/*                                   Routes                                    */
/* -------------------------------------------------------------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);

/* -------------------------------------------------------------------------- */
/*                          Global Error Handler                                */
/* -------------------------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    requestId: req.id,
  });
});

/* -------------------------------------------------------------------------- */
/*                              MongoDB Connection                             */
/* -------------------------------------------------------------------------- */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false,
    });

    console.log("MongoDB connected");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB runtime error:", err);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

/* -------------------------------------------------------------------------- */
/*                               Server Startup                                */
/* -------------------------------------------------------------------------- */
const server = app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});

/* -------------------------------------------------------------------------- */
/*                        Graceful Shutdown Handling                            */
/* -------------------------------------------------------------------------- */
const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    await mongoose.connection.close(false);
    console.log("Server closed. MongoDB disconnected.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

/* -------------------------------------------------------------------------- */
/*                          Unhandled Promise Rejection                         */
/* -------------------------------------------------------------------------- */
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});
