import React from "react";

export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export const Table = <T,>({ columns, data }: TableProps<T>) => {
  return (
    <div className="overflow-x-auto w-full rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
      <table className="w-full border-collapse text-left text-sm text-slate-200">
        <thead className="bg-slate-800 text-xs font-semibold uppercase tracking-wider text-indigo-300 border-b border-slate-700">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-6 py-4">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-slate-400"
              >
                No items found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`transition-colors duration-150 group hover:bg-indigo-500/10 ${
                  rowIndex % 2 === 0 ? "bg-slate-900" : "bg-slate-800/60"
                }`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 align-middle">
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
