import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import researchPaperRoutes from "./routes/researchpaper.routes.js";

dotenv.config(); // reads the key-value pairs from .env and inject the values in process.env

const app = express();

app.use(
  cors({
    // allow only this origin (request from this URL would get allowed, others -> rejected)
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json()); // to parse json request body
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/research-papers", researchPaperRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on the port: ${PORT}`);
});
