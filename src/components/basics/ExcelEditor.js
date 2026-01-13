import React, { useState } from "react";
import {
  Edit2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export const ExcelEditor = ({ data, setData, headers, setHeaders }) => {
  const [editingHeaderIndex, setEditingHeaderIndex] = useState(null);
  const [tempHeaderName, setTempHeaderName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust to fit UI nicely

  if (!data || data.length === 0) return null;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const handleHeaderClick = (index, currentName) => {
    setEditingHeaderIndex(index);
    setTempHeaderName(currentName);
  };

  const saveHeader = (index) => {
    if (!tempHeaderName.trim()) {
      setEditingHeaderIndex(null);
      return;
    }

    // Rename key in all data objects
    const oldKey = headers[index];
    const newKey = tempHeaderName.trim();

    if (oldKey === newKey) {
      setEditingHeaderIndex(null);
      return;
    }

    const newHeaders = [...headers];
    newHeaders[index] = newKey;
    setHeaders(newHeaders);

    const newData = data.map((row) => {
      const newRow = { ...row };
      if (newRow.hasOwnProperty(oldKey)) {
        newRow[newKey] = newRow[oldKey];
        delete newRow[oldKey];
      }
      return newRow;
    });
    setData(newData);
    setEditingHeaderIndex(null);
  };

  const handleCellEdit = (rowIndex, header, value) => {
    const realIndex = startIndex + rowIndex;
    const newData = [...data];
    newData[realIndex] = { ...newData[realIndex], [header]: value };
    setData(newData);
  };

  return (
    <div className="w-full">
      <div className="w-[95%]  overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#F9FAFB]">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-4 whitespace-nowrap min-w-[150px] border-b border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    {editingHeaderIndex === index ? (
                      <div className="flex items-center bg-white border border-blue-400 rounded-lg px-2 py-1 shadow-sm">
                        <input
                          autoFocus
                          className="outline-none text-sm font-medium text-gray-700 bg-transparent min-w-[80px]"
                          value={tempHeaderName}
                          onChange={(e) => setTempHeaderName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveHeader(index);
                            if (e.key === "Escape") setEditingHeaderIndex(null);
                          }}
                        />
                        <button
                          onClick={() => saveHeader(index)}
                          className="text-green-600 hover:text-green-700 ml-1"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => setEditingHeaderIndex(null)}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#E0E7FF] text-[#3730A3] px-3 py-1.5 rounded-full font-bold">
                        <span>{header}</span>
                        <button
                          onClick={() => handleHeaderClick(index, header)}
                          className="hover:text-blue-800 transition"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {currentData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
              >
                {headers.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-3 border-r border-transparent"
                  >
                    <input
                      className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-300 rounded px-2 py-1 text-gray-700"
                      value={row[header] || ""}
                      onChange={(e) =>
                        handleCellEdit(rowIndex, header, e.target.value)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="w-[95%] flex justify-end mt-4">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm overflow-x-auto max-w-full">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 text-gray-500"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 text-gray-500"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  currentPage === page
                    ? "bg-[#ABE7E5] text-[#0E3C42]"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 text-gray-500"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 disabled:opacity-50"
          >
            Última <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
