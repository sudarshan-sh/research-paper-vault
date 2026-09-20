export const API_URL =
  (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env
    .VITE_API_URL || "http://localhost:8000";
export const AUTH_API = `${API_URL}/api/auth`;

export const RESEARCH_PAPER_API = `${API_URL}/api/research-papers`;
