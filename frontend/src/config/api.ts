export const API_URL =
  (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env
    .VITE_API_URL || "http://localhost:5000";
export const AUTH_API = `${API_URL}/api/auth`;
