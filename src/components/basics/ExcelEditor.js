import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import CustomButton from "./CustomButton";
import CustomIcon from "./CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomText from "./CustomText";
import EditColumnModal from "../modals/EditColumnModal";

export const ExcelEditor = ({
  data,
  setData,
  headers,
  setHeaders,
  columnAliases,
  setColumnAliases,
}) => {
  const [editingHeaderIndex, setEditingHeaderIndex] = useState(null);
  const [tempHeaderName, setTempHeaderName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

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

    const originalKey = headers[index];
    const newAlias = tempHeaderName.trim();

    if (originalKey === newAlias) {
      // If alias matches original, we could remove the alias?
      // For now, setting it is fine.
    }

    // Update Alias
    if (setColumnAliases) {
      setColumnAliases((prev) => ({
        ...prev,
        [originalKey]: newAlias,
      }));
    }

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
      {/* TABLE */}
      <div className="max-w-[1040px] overflow-x-auto border border-gray-200 rounded-lg">
        <table className="max-w-[1040px] text-left border-collapse">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-4 whitespace-nowrap min-w-[150px] border-b border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-[#D5DAFF] py-2 px-5 rounded-full border border-[#D5DAFF]">
                      <CustomText
                        variant="labelL"
                        className="text-[#00093F] font-medium"
                      >
                        {columnAliases && columnAliases[header]
                          ? columnAliases[header]
                          : header}
                      </CustomText>
                    </div>
                    <CustomButton
                      onClick={() => handleHeaderClick(index, header)}
                      className="bg-transparent border-none hover:bg-transparent"
                    >
                      <CustomIcon path={ICON_PATHS.pencil} size={16} />
                    </CustomButton>
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
                  <td key={colIndex} className="px-6 py-3">
                    <input
                      className="w-full bg-transparent text-[#3D3D44] text-[14px] outline-none focus:ring-1 focus:ring-blue-300 rounded px-2 py-1"
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

      {/* PAGINATION */}
      <div className="w-[95%] flex justify-end mt-4">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronsLeft size={18} />
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-1 mx-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-full text-sm font-bold ${
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
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm font-medium disabled:opacity-50"
          >
            Última <ChevronsRight size={14} />
          </button>
        </div>
      </div>

      {/* MODAL */}
      <EditColumnModal
        isOpen={editingHeaderIndex !== null}
        columnName={
          editingHeaderIndex !== null
            ? columnAliases && columnAliases[headers[editingHeaderIndex]]
              ? columnAliases[headers[editingHeaderIndex]]
              : headers[editingHeaderIndex]
            : ""
        }
        value={tempHeaderName}
        onChange={setTempHeaderName}
        onCancel={() => setEditingHeaderIndex(null)}
        onSave={() => saveHeader(editingHeaderIndex)}
      />
    </div>
  );
};
