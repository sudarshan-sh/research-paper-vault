import express from "express";
import {
  getResearchPapersController,
  uploadResearchPaperController,
} from "../controllers/researchpaper.controller.js";
import { protectedRoute } from "../middleware/auth.js";
import { uploadPaperFile } from "../middleware/upload.js";

const router = express.Router();

// upload research paper (auth first so anonymous requests never write to disk)
router.post(
  "/upload",
  protectedRoute,
  uploadPaperFile,
  uploadResearchPaperController,
);

// get research papers
router.get("/", getResearchPapersController);

export default router;
