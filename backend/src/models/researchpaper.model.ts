import type { ResearchPaper } from "../types/researchpaper.types.js";

export const toPublicResearchPaper = (researchPaper: ResearchPaper) => {
  return {
    id: researchPaper.id,
    title: researchPaper.title,
    authors: researchPaper.authors,
    abstract: researchPaper.abstract,
    fileName: researchPaper.fileName,
    filePath: researchPaper.filePath,
    fileSizeBytes: researchPaper.fileSizeBytes,
    uploadedBy: researchPaper.uploadedBy,
    createdAt: researchPaper.createdAt,
  };
};
