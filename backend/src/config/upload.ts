import path from "node:path";
import { fileURLToPath } from "node:url";

// backend/ folder (same depth from both src/ and dist/)
export const BACKEND_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

// papers are stored on the local disk here, the DB only keeps the relative path
export const PAPERS_RELATIVE_DIR = "uploads/papers";
export const PAPERS_DIR = path.join(BACKEND_ROOT, PAPERS_RELATIVE_DIR);

export const PAPER_FIELD_NAME = "paper"; // formData.append("paper", file)
export const MAX_PAPER_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_DB_VARCHAR_LENGTH = 100; // title, file_name columns are VARCHAR(100)
