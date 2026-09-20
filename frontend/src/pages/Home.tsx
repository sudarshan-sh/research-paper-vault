import axios, { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import type { User } from "../types/user.types";
import { RESEARCH_PAPER_API } from "../config/api";
import ResearchPapersList from "../components/ResearchPapersList";
import type { ResearchPaper } from "../types/researchpaper.types";

const Home = ({ user }: { user: User | null }) => {
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>([]);
  // pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  // file input
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

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const { data } = await axios.get(
          `${RESEARCH_PAPER_API}?page=${page}&pageSize=${pageSize}&search=${search}`,
        );
        setResearchPapers(data.researchPapers);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error("Error fetching research papers:", error);
      }
    };
    fetchPapers();
  }, [page, pageSize, search]);

  // reset to page 1 whenever the search term changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
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

      <ResearchPapersList researchPapers={researchPapers} />
    </div>
  );
};

export default Home;
