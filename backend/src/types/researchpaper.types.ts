// for defining the structural blueprint of a research paper
export interface ResearchPaper {
  id: number;
  title: string;
  authors: string[];
  abstract: string;
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  uploadedBy: number;
  createdAt: Date;
}
