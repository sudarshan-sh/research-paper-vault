import type { Request, Response } from "express";
import { handleResponse, parsePositiveInt } from "../helper/helper.js";
import {
  getOriginalFileName,
  hasPdfSignature,
  removeFile,
} from "../helper/file.js";
import { extractPdfMetadata } from "../helper/pdf.js";
import {
  MAX_DB_VARCHAR_LENGTH,
  PAPERS_RELATIVE_DIR,
} from "../config/upload.js";
import { toPublicResearchPaper } from "../models/researchpaper.model.js";
import {
  getResearchPaperService,
  getResearchPapersService,
  uploadResearchPaperService,
} from "../services/researchpaper.service.js";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

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

// get research papers
export const getResearchPapersController = async (
  req: Request,
  res: Response,
) => {
  // the list only shows the papers uploaded by the logged-in user
  if (!req.user) {
    return handleResponse(res, 401, "Not authorized!");
  }
  const userId = req.user.id;

  const page = parsePositiveInt(req.query.page, 1);
  const pageSize = parsePositiveInt(
    req.query.pageSize,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
  );
  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim() || null
      : null;

  try {
    const { researchPapers, pagination } = await getResearchPapersService(
      page,
      pageSize,
      search,
      userId,
    );

    return handleResponse(res, 200, "Research papers fetched successfully", {
      researchPapers,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching research papers:", error);
    return handleResponse(res, 500, "Internal server error");
  }
};

// get research paper
export const getResearchPaperController = async (
  req: Request,
  res: Response,
) => {
  const id = parsePositiveInt(req.params.id, 0);
  try {
    const paper = await getResearchPaperService(id);
    if (!paper) {
      return handleResponse(res, 404, "Research paper not found");
    }
    return handleResponse(res, 200, "Research paper fetched successfully", {
      researchPaper: toPublicResearchPaper(paper),
    });
  } catch (error) {
    console.error("Error fetching research paper:", error);
    return handleResponse(res, 500, "Internal server error");
  }
};
