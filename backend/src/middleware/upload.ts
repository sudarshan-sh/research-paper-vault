import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { handleResponse } from "../helper/helper.js";
import {
  MAX_PAPER_SIZE_BYTES,
  PAPER_FIELD_NAME,
  PAPERS_DIR,
} from "../config/upload.js";

class InvalidFileError extends Error {}

fs.mkdirSync(PAPERS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PAPERS_DIR),
  // random name so uploads never collide and user-supplied names never touch the disk path
  filename: (_req, _file, cb) => cb(null, `${randomUUID()}.pdf`),
});

// multer instance ka kaam hai- file receive then validate, then save to disk and then return the file path to controller
const upload = multer({
  storage,
  limits: { fileSize: MAX_PAPER_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      path.extname(file.originalname).toLowerCase() === ".pdf";
    if (!isPdf) {
      return cb(new InvalidFileError("Only PDF files are allowed"));
    }
    cb(null, true);
  },
}).single(PAPER_FIELD_NAME);

// runs multer and turns its errors into the standard API response
export const uploadPaperFile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return handleResponse(
          res,
          413,
          `File too large. Max size is ${MAX_PAPER_SIZE_BYTES / 1024 / 1024} MB`,
        );
      }
      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return handleResponse(
          res,
          400,
          `Send the PDF in a single field named "${PAPER_FIELD_NAME}"`,
        );
      }
      return handleResponse(res, 400, error.message);
    }

    if (error instanceof InvalidFileError) {
      return handleResponse(res, 400, error.message);
    }

    console.error("Error uploading file:", error);
    return handleResponse(res, 500, "Internal server error");
  });
};
