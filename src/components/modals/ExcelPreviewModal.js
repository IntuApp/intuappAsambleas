import React, { useState } from "react";
import { Check, FileSpreadsheet, Plus, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { validateExcelData } from "@/lib/excelValidation";
import EditColumnModal from "./EditColumnModal";

const ExcelPreviewModal = ({
  isOpen,
  onClose,
  onAccept,
  data,
  setData,
  fileName,
  headers,
  setHeaders,
  columnAliases,
  setColumnAliases,
}) => {
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState("");

  if (!isOpen) return null;

  const safeHeaders =
    headers && headers.length > 0
      ? headers
      : data && data.length > 0
      ? Object.keys(data[0])
      : [];

  /* ---------------------- */
  /* VALIDACIÓN             */
  /* ---------------------- */
  const handleValidationAndAccept = () => {
    if (!data || data.length === 0) {
      toast.error("No hay datos para guardar.");
      return;
    }

    const validation = validateExcelData(data);
    if (!validation.valid) {
      console.log("validation", validation);
      toast.error("Hay errores en los datos.");
      return;
    }

    onAccept();
  };

  /* ---------------------- */
  /* AGREGAR FILA           */
  /* ---------------------- */
  const handleAddRow = () => {
    const newRow = {};
    safeHeaders.forEach((h) => (newRow[h] = ""));
    setData([...data, newRow]);
  };

  /* ---------------------- */
  /* EDITAR COLUMNA         */
  /* ---------------------- */
  const handleOpenEditColumn = (header) => {
    setEditingColumn(header);
    setNewColumnName(header);
  };

  const handleSaveColumnName = () => {
  if (!newColumnName.trim()) {
    toast.error("El nombre no puede estar vacío");
    return;
  }

  setColumnAliases((prev) => ({
    ...prev,
    [editingColumn]: newColumnName,
  }));

  setEditingColumn(null);
};



  /* ---------------------- */
  /* RENDER                 */
  /* ---------------------- */
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg text-green-600">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0E3C42]">
                  Vista Previa y Edición
                </h3>
                <p className="text-sm text-gray-500">
                  {fileName} • {data.length} registros
                </p>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col min-h-full">

              {/* BOTÓN AGREGAR ARRIBA */}
              <div className="p-4 border-b bg-gray-50 flex justify-start">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  <Plus size={18} />
                  Agregar Registro
                </button>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      {safeHeaders.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-4 whitespace-nowrap min-w-[150px]"
                        >
                          <div className="flex items-center gap-2">
                            <span>{columnAliases?.[header] || header}</span>

                            <Pencil
                              size={16}
                              className="cursor-pointer text-gray-400 hover:text-blue-500"
                              onClick={() =>
                                handleOpenEditColumn(header)
                              }
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y bg-white">
                    {data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {safeHeaders.map((header, colIndex) => (
                          <td key={colIndex} className="px-2 py-1">
                            <input
                              className="w-full border border-transparent hover:border-gray-200 focus:border-blue-400 focus:bg-blue-50 rounded px-3 py-2 outline-none"
                              value={row[header] || ""}
                              onChange={(e) => {
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
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border text-gray-600"
            >
              Cancelar
            </button>

            <button
              onClick={handleValidationAndAccept}
              className="px-6 py-2.5 rounded-full bg-[#0E3C42] text-white flex items-center gap-2"
            >
              <Check size={18} />
              Validar y Continuar
            </button>
          </div>
        </div>
      </div>

      {/* MODAL EDITAR COLUMNA */}
      <EditColumnModal
        isOpen={!!editingColumn}
        columnName={editingColumn}
        value={newColumnName}
        onChange={setNewColumnName}
        onCancel={() => setEditingColumn(null)}
        onSave={handleSaveColumnName}
      />
    </>
  );
};

export default ExcelPreviewModal;
