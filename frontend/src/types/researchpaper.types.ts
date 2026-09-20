export interface ResearchPaper {
  id: number;
  title: string;
  authors: string[];
  abstract: string;
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  uploadedBy: number;
  createdAt: string; // ISO date string, JSON has no Date type
}

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
