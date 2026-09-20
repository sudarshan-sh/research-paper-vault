import {
  getResearchPaper,
  getResearchPapers,
  uploadResearchPaper,
} from "../repositories/researchpaper.repository.js";
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

// get research papers
export const getResearchPapersService = async (
  page: number,
  pageSize: number,
  search: string | null,
  userId: number,
) => {
  try {
    const { researchPapers, total } = await getResearchPapers(
      page,
      pageSize,
      search,
      userId,
    );
    return {
      researchPapers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("Error fetching research papers:", error);
    throw error;
  }
};

// get research paper
export const getResearchPaperService = async (id: number) => {
  try {
    const paper = await getResearchPaper(id);
    return paper;
  } catch (error) {
    console.error("Error fetching research paper:", error);
    throw error;
  }
};
