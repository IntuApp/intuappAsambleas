import React, { useState } from "react";
import { X, Check, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { validateExcelData } from "@/lib/excelValidation";

const ExcelPreviewModal = ({
  isOpen,
  onClose,
  onAccept,
  data,
  setData,
  fileName,
  headers,
}) => {
  if (!isOpen) return null;

  console.log("data", data);
  console.log("headers", headers);
  console.log("fileName", fileName);
  console.log("setData", setData);
  console.log("onAccept", onAccept);
  console.log("onClose", onClose);
  

  // Use provided headers or fallback to keys of first row
  const safeHeaders =
    headers && headers.length > 0
      ? headers
      : data && data.length > 0
      ? Object.keys(data[0])
      : ["Columna 1", "Columna 2"];

  const handleValidationAndAccept = () => {
    if (!data || data.length === 0) {
      toast.error("No hay datos para guardar.");
      return;
    }
    const validation = validateExcelData(data);
    if (!validation.valid) {
      toast.error(
        <div>
          <p className="font-bold">Errores en los datos:</p>
          <ul className="list-disc pl-4 text-sm max-h-40 overflow-y-auto">
            {validation.errors.slice(0, 10).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {validation.errors.length > 10 && (
              <li>... y {validation.errors.length - 10} más.</li>
            )}
          </ul>
        </div>,
        { autoClose: 10000 }
      );
      return;
    }
    onAccept();
  };

  const handleAddRow = () => {
    if (!setData) return;
    const newRow = {};
    safeHeaders.forEach((h) => (newRow[h] = ""));
    setData([...data, newRow]);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0E3C42]">
                Vista Previa y Edición de Datos
              </h3>
              <p className="text-sm text-gray-500">
                Archivo: <span className="font-medium">{fileName}</span> •{" "}
                {data.length} registros
              </p>
            </div>
          </div>
         
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-full">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                  <tr>
                    {safeHeaders.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 whitespace-nowrap min-w-[150px] bg-gray-50"
                      >
                        {header}
                      </th>
                    ))}
                    <th className="px-4 py-4 w-12 bg-gray-50"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-gray-50 transition group"
                    >
                     
                      {safeHeaders.map((header, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-2 py-1 border-r border-transparent group-hover:border-gray-100 last:border-0"
                        >
                          <input
                            className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-400 focus:bg-blue-50 rounded px-3 py-2 outline-none transition-all text-gray-700"
                            value={row[header] || ""}
                            onChange={(e) => {
                              if (!setData) return;
                              const newData = [...data];
                              newData[rowIndex] = {
                                ...newData[rowIndex],
                                [header]: e.target.value,
                              };
                              setData(newData);
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add Row Button */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition w-fit"
                >
                  <Plus size={18} />
                  Agregar Registro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium transition"
          >
            Cancelar / Subir otro
          </button>
          <button
            onClick={handleValidationAndAccept}
            className="px-6 py-2.5 rounded-full bg-[#0E3C42] text-white hover:bg-[#0b2d32] font-medium shadow-lg shadow-[#0E3C42]/20 flex items-center gap-2 transition"
          >
            <Check size={18} />
            Validar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelPreviewModal;
