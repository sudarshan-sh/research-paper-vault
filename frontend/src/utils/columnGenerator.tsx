import { useNavigate } from "react-router-dom";
import { type Column } from "../components/Table";
import type { ResearchPaper } from "../types/researchpaper.types";

export const generateColumns = (
  requestedColumns: string[],
): Column<ResearchPaper>[] => {
  const navigate = useNavigate();

  // Master map of all possible available columns
  const columnMap: Record<string, Column<ResearchPaper>> = {
    title: {
      header: "Title",
      accessor: (paper) => (
        <span
          className="font-medium text-white group-hover:text-emerald-400 transition-colors cursor-pointer"
          onClick={() => navigate(`/research-papers/${paper.id}`)}
        >
          {paper.title}
        </span>
      ),
    },
    authors: {
      header: "Authors",
      accessor: (paper) => (
        <span className="text-slate-300">{paper.authors.join(", ")}</span>
      ),
    },
    uploaded_date: {
      header: "Uploaded Date",
      accessor: (paper) => (
        <span className="text-slate-300">
          {new Date(paper.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  };

  return requestedColumns.map((key) => columnMap[key]).filter(Boolean); // Filters out any invalid keys safely
};
