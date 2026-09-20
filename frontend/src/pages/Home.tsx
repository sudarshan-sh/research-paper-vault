import axios, { AxiosError } from "axios";
import { useRef, useState } from "react";
import type { User } from "../types/user.types";
import { RESEARCH_PAPER_API } from "../config/api";

const Home = ({ user }: { user: User | null }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("paper", file);
      const response = await axios.post(
        `${RESEARCH_PAPER_API}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      alert(response.data.message || "Upload successful!");
      setFile(null);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      alert(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-white">My Papers</h2>
          {user && (
            <p className="text-sm text-gray-400">Welcome back, {user.name}!</p>
          )}
        </div>

        {/* Upload controls — top right */}
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {file ? (
            <>
              <span
                className="max-w-[220px] truncate text-sm text-gray-300"
                title={file.name}
              >
                {file.name}
              </span>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-white"
                title="Cancel"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              + Upload Paper
            </button>
          )}
        </div>
      </div>

      {/* Main content — empty state */}
      <div className="flex flex-col items-center justify-center gap-3 mt-24 text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm">No papers uploaded yet.</p>
        <p className="text-xs">
          Click{" "}
          <span
            className="cursor-pointer text-blue-400 hover:underline"
            onClick={() => fileInputRef.current?.click()}
          >
            + Upload Paper
          </span>{" "}
          to get started.
        </p>
      </div>
    </div>
  );
};

export default Home;
