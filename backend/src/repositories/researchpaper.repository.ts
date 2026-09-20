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
  userId: number,
) => {
  // $1 user, $2 search (NULL = no search), $3 page size, $4 offset
  const query = `
    SELECT
      id,
      title,
      authors,
      abstract,
      file_name AS "fileName",
      file_path AS "filePath",
      file_size_bytes AS "fileSizeBytes",
      uploaded_by AS "uploadedBy",
      created_at AS "createdAt",
      COUNT(*) OVER() AS total_count
    FROM research_papers
    WHERE uploaded_by = $1
      AND (
        $2::text IS NULL
        OR title ILIKE '%' || $2 || '%'
        OR array_to_string(authors, ', ') ILIKE '%' || $2 || '%'
      )
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4`;
  const values = [userId, search, pageSize, (page - 1) * pageSize];

  try {
    const result = await pool.query(query, values);
    // COUNT is a BIGINT, pg returns it as a string
    const total = Number(result.rows[0]?.total_count ?? 0);
    const researchPapers = result.rows.map(
      ({ total_count, ...paper }) => paper,
    );
    return { researchPapers, total };
  } catch (error) {
    console.error("Error fetching research papers:", error);
    throw error;
  }
};

// get research paper
export const getResearchPaper = async (id: number) => {
  const query = `
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
    WHERE id = $1
    LIMIT 1`;
  const values = [id];
  try {
    const result = await pool.query(query, values);
    const row = result.rows[0];
    return row;
  } catch (error) {
    console.error("Error fetching research paper:", error);
    throw error;
  }
};
