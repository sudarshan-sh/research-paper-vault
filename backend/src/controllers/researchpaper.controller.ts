import type { Request, Response } from "express";
import { handleResponse } from "../helper/helper.js";
import {
  getOriginalFileName,
  hasPdfSignature,
  removeFile,
} from "../helper/file.js";
import { extractPdfMetadata } from "../helper/pdf.js";
import { MAX_DB_VARCHAR_LENGTH, PAPERS_RELATIVE_DIR } from "../config/upload.js";
import { toPublicResearchPaper } from "../models/researchpaper.model.js";
import { uploadResearchPaperService } from "../services/researchpaper.service.js";

export const uploadResearchPaperController = async (
  req: Request,
  res: Response,
) => {
  const file = req.file;
  if (!file) {
    return handleResponse(res, 400, "PDF file is required");
  }

  // multer already wrote the PDF to disk, it is kept only once its record is saved
  let saved = false;

  try {
    if (!req.user) {
      return handleResponse(res, 401, "Not authorized!");
    }

    if (!(await hasPdfSignature(file.path))) {
      return handleResponse(res, 400, "Uploaded file is not a valid PDF");
    }

    const fileName = getOriginalFileName(file.originalname);

    // extract title, authors, abstract from the PDF text
    const { title, authors, abstract } = await extractPdfMetadata(
      file.path,
      fileName.replace(/\.pdf$/i, ""),
    );

    const paper = await uploadResearchPaperService({
      title: title.slice(0, MAX_DB_VARCHAR_LENGTH),
      authors,
      abstract,
      fileName,
      filePath: `${PAPERS_RELATIVE_DIR}/${file.filename}`,
      fileSizeBytes: file.size,
      uploadedBy: req.user.id,
    });
    saved = true;

    return handleResponse(res, 201, "Research paper uploaded successfully", {
      researchPaper: toPublicResearchPaper(paper),
    });
  } catch (error) {
    console.error("Error uploading research paper:", error);
    return handleResponse(res, 500, "Internal server error");
  } finally {
    if (!saved) await removeFile(file.path);
  }
};
