import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ResearchPaper } from "../types/researchpaper.types";
import { RESEARCH_PAPER_API } from "../config/api";
import { formatDate, formatFileSize } from "../utils/format";

const sectionHeading =
  "text-xs font-semibold uppercase tracking-wider text-indigo-300";

const DetailsSkeleton = () => (
  <div
    className="animate-pulse rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl sm:p-8"
    aria-busy="true"
    aria-label="Loading research paper"
  >
    <div className="h-8 w-3/4 rounded bg-slate-700" />
    <div className="mt-4 h-4 w-1/3 rounded bg-slate-800" />
    <div className="mt-10 flex gap-2">
      <div className="h-7 w-28 rounded-full bg-slate-800" />
      <div className="h-7 w-32 rounded-full bg-slate-800" />
      <div className="h-7 w-24 rounded-full bg-slate-800" />
    </div>
    <div className="mt-10 space-y-3">
      <div className="h-4 rounded bg-slate-800" />
      <div className="h-4 rounded bg-slate-800" />
      <div className="h-4 w-5/6 rounded bg-slate-800" />
      <div className="h-4 w-2/3 rounded bg-slate-800" />
    </div>
  </div>
);

const ResearchPaperDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [researchPaper, setResearchPaper] = useState<ResearchPaper | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ignore a response that arrives after the id changed or the page was closed
    let cancelled = false;

    const fetchPaper = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${RESEARCH_PAPER_API}/${id}`);
        if (!cancelled) setResearchPaper(data.researchPaper);
      } catch (err) {
        if (cancelled) return;
        const { response } = err as AxiosError<{ message?: string }>;
        setResearchPaper(null);
        setError(
          response?.status === 404
            ? "Research paper not found."
            : response?.data?.message || "Failed to load the research paper.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPaper();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const downloadPaper = async () => {
    if (!researchPaper) return;

    try {
      const { data } = await axios.post<Blob>(
        `${RESEARCH_PAPER_API}/download`,
        { filePath: researchPaper.filePath, fileName: researchPaper.fileName },
        { responseType: "blob" },
      );

      // create a temporary URL in the browser's memory to download the file
      const localURL = URL.createObjectURL(data);
      // create a link to download the file
      const downloadLink = document.createElement("a");
      downloadLink.href = localURL;
      downloadLink.download = researchPaper.fileName;
      downloadLink.click(); // trigger the download
      URL.revokeObjectURL(localURL); // free memory
    } catch (err) {
      // with responseType "blob" an error response is a Blob too, its JSON message is inside
      let message = "Download failed. Please try again.";
      try {
        // try to parse the error body as JSON
        const blob = (err as AxiosError<Blob>).response?.data;
        message = JSON.parse((await blob?.text()) ?? "").message || message;
      } catch {
        // not a JSON error body, keep the default message
      }
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <span aria-hidden="true">←</span> Back to papers
          </Link>
          <button
            onClick={downloadPaper}
            disabled={!researchPaper}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download
          </button>
        </div>

        {loading ? (
          <DetailsSkeleton />
        ) : error || !researchPaper ? (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-10 text-center text-red-300"
          >
            {error ?? "Research paper not found."}
          </div>
        ) : (
          <article className="rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
            <header className="border-b border-slate-700 px-5 py-6 sm:px-8">
              <h1 className="text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl">
                {researchPaper.title}
              </h1>
              <p className="mt-3 text-sm text-slate-400">
                Uploaded on {formatDate(researchPaper.createdAt)}
              </p>
            </header>

            <div className="space-y-8 px-5 py-6 sm:px-8">
              <section>
                <h2 className={sectionHeading}>Authors</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {researchPaper.authors.map((author, index) => (
                    <li
                      key={`${author}-${index}`}
                      className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-slate-200"
                    >
                      {author}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className={sectionHeading}>Abstract</h2>
                <p className="mt-3 leading-relaxed text-slate-300">
                  {researchPaper.abstract || "No abstract available."}
                </p>
              </section>

              <section>
                <h2 className={sectionHeading}>File</h2>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-slate-500">File name</dt>
                    <dd className="mt-1 break-all text-sm text-slate-200">
                      {researchPaper.fileName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Size</dt>
                    <dd className="mt-1 text-sm text-slate-200">
                      {formatFileSize(researchPaper.fileSizeBytes)}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </article>
        )}
      </main>
    </div>
  );
};

export default ResearchPaperDetails;
