import pool from "../config/db.js";
import type {
  CreateResearchPaperInput,
  ResearchPaper,
} from "../types/researchpaper.types.js";

// upload a research paper (metadata only, the PDF itself lives on the local disk)
export const uploadResearchPaper = async (
  paper: CreateResearchPaperInput,
): Promise<ResearchPaper> => {
  const query = `
    INSERT INTO research_papers
      (title, authors, abstract, file_name, file_path, file_size_bytes, uploaded_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id,
      title,
      authors,
      abstract,
      file_name AS "fileName",
      file_path AS "filePath",
      file_size_bytes AS "fileSizeBytes",
      uploaded_by AS "uploadedBy",
      created_at AS "createdAt"`;
  const values = [
    paper.title,
    paper.authors,
    paper.abstract,
    paper.fileName,
    paper.filePath,
    paper.fileSizeBytes,
    paper.uploadedBy,
  ];
  try {
    const result = await pool.query(query, values);
    const row = result.rows[0];
    // pg returns BIGINT as a string
    return { ...row, fileSizeBytes: Number(row.fileSizeBytes) };
  } catch (error) {
    console.error("Error uploading research paper:", error);
    throw error;
  }
};

// get research papers
export const getResearchPapers = async (
  page: number,
  pageSize: number,
  search: string | null,
) => {
  let query = `
    SELECT
      id,
      title,
      authors,
      abstract,
      file_name AS "fileName",
      file_path AS "filePath",
      file_size_bytes AS "fileSizeBytes",
      uploaded_by AS "uploadedBy",
      created_at AS "createdAt"
    FROM research_papers
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2`;
  const values: Array<number | string> = [pageSize, (page - 1) * pageSize];

  if (search) {
    query += ` WHERE title ILIKE $3`;
    values.push(`%${search}%`);
  }
  try {
    const result = await pool.query(query, values);
    const total = result.rows[0]?.total_count || 0;
    const researchPapers = result.rows.map(
      ({ total_count, ...paper }) => paper,
    );
    return { researchPapers, total };
  } catch (error) {
    console.error("Error fetching research papers:", error);
    throw error;
  }
};
