import { uploadResearchPaper } from "../repositories/researchpaper.repository.js";
import type { CreateResearchPaperInput } from "../types/researchpaper.types.js";

export const uploadResearchPaperService = async (
  paper: CreateResearchPaperInput,
) => {
  try {
    return await uploadResearchPaper(paper);
  } catch (error) {
    console.error("Error uploading research paper:", error);
    throw error;
  }
};
