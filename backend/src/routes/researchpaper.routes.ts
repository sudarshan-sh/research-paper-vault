import express from "express";
import {
  downloadResearchPaperController,
  getResearchPaperController,
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
router.get("/", protectedRoute, getResearchPapersController);

// get research paper
router.get("/:id", getResearchPaperController);

// download research paper (POST: the UI sends filePath and fileName in the body)
router.post("/download", protectedRoute, downloadResearchPaperController);

export default router;
