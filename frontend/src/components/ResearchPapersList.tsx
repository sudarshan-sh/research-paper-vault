import React from "react";
import { Table } from "./Table";
import { generateColumns } from "../utils/columnGenerator";
import type { ResearchPaper } from "../types/researchpaper.types";

const ResearchPapersList = ({
  researchPapers,
}: {
  researchPapers: ResearchPaper[];
}) => {
  // Define Table Column rules explicitly
  const columnsToShow = ["title", "authors", "uploaded_date"];
  const columns = generateColumns(columnsToShow);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Render our highly reusable component */}
      <Table columns={columns} data={researchPapers} />
    </div>
  );
};

export default ResearchPapersList;
