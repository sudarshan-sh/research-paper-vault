import fs from "node:fs";
import type { Request, Response } from "express";
import { handleResponse } from "../helper/helper.js";
import { PAPERS_RELATIVE_DIR } from "../config/upload.js";
import { toPublicResearchPaper } from "../models/researchpaper.model.js";
import { uploadResearchPaperService } from "../services/researchpaper.service.js";
import { extractPdfMetadata } from "../helper/pdf.js";

const MAX_DB_VARCHAR_LENGTH = 100; // title, file_name columns are VARCHAR(100)

// multer decodes the filename as latin1, this restores the real utf-8 name
const getOriginalFileName = (name: string) => {
  const decoded = Buffer.from(name, "latin1").toString("utf8");
  if (decoded.length <= MAX_DB_VARCHAR_LENGTH) return decoded;
  return `${decoded.slice(0, MAX_DB_VARCHAR_LENGTH - ".pdf".length)}.pdf`;
};

// the mimetype comes from the client, so also check the real file signature
const hasPdfSignature = async (filePath: string) => {
  const handle = await fs.promises.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(5);
    await handle.read(buffer, 0, 5, 0);
    return buffer.toString("latin1") === "%PDF-";
  } finally {
    await handle.close();
  }
};

export const uploadResearchPaperController = async (
  req: Request,
  res: Response,
) => {
  const file = req.file;
  if (!file) {
    return handleResponse(res, 400, "PDF file is required");
  }

  // multer already wrote the file to disk, remove it when the request is rejected
  const removeUploadedFile = () =>
    fs.promises.unlink(file.path).catch(() => {});

  const reject = async (status: number, message: string) => {
    await removeUploadedFile();
    return handleResponse(res, status, message);
  };

  if (!req.user) {
    return reject(401, "Not authorized!");
  }

  try {
    if (!(await hasPdfSignature(file.path))) {
      return reject(400, "Uploaded file is not a valid PDF");
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

    return handleResponse(res, 201, "Research paper uploaded successfully", {
      researchPaper: toPublicResearchPaper(paper),
    });
  } catch (error) {
    console.error("Error uploading research paper:", error);
    return reject(500, "Internal server error");
  }
};
