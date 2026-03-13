"use client";
import React, { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import * as XLSX from "xlsx"; // 🔥 Necesario para leer el Excel

import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import { ExcelEditor } from "@/components/entities/ExcelEditor"; // Importamos tu editor
import { formatIsoDateToShort } from "@/lib/utils";

export default function EntityDatabaseManager({ entityData, registries = [], onUpdateDatabase }) {
    // Referencia para el input de archivo oculto
    const fileInputRef = useRef(null);

    // Estados de la tabla original
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --------------------------------------------------------
    // NUEVOS ESTADOS PARA LA ACTUALIZACIÓN (MODAL Y EXCEL)
    // --------------------------------------------------------
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [excelData, setExcelData] = useState([]);
    const [excelHeaders, setExcelHeaders] = useState([]);
    const [excelFileName, setExcelFileName] = useState("");
    const [columnAliases, setColumnAliases] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const displayHeaders = useMemo(() => {
        if (registries.length === 0) return [];

        let baseHeaders = [];

        if (entityData?.headers && entityData.headers.length > 0) {
            baseHeaders = entityData.headers;
        } else {
            baseHeaders = Object.keys(registries[0]).filter(k => k !== 'id');
        }

        const filteredHeaders = baseHeaders.filter(headerKey => {
            return registries.some(row => {
                const value = row[headerKey];
                return value !== null && value !== undefined && String(value).trim() !== "";
            });
        });

        return filteredHeaders.map(header => ({
            original: header,
            display: entityData.columnAliases?.[header] || header
        }));
    }, [registries, entityData]);

    // 2. Lógica de Paginación
    const totalPages = Math.max(1, Math.ceil(registries.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = registries.slice(startIndex, startIndex + itemsPerPage);

    // --------------------------------------------------------
    // FUNCIONES DE ACTUALIZACIÓN
    // --------------------------------------------------------

    // Leer el archivo y abrir el modal
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setExcelFileName(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                // Convertimos el Excel a JSON
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length > 0) {
                    const headers = Object.keys(data[0]);
                    setExcelHeaders(headers);
                    setExcelData(data);

                    // Si ya existían alias en la entidad, intentamos conservarlos para las columnas que coincidan
                    const initialAliases = {};
                    headers.forEach(h => {
                        initialAliases[h] = entityData?.columnAliases?.[h] || h;
                    });
                    setColumnAliases(initialAliases);

                    // Abrimos el modal
                    setIsUpdateModalOpen(true);
                } else {
                }
            } catch (error) {
                console.error("Error leyendo Excel:", error);
            }
        };
        reader.readAsBinaryString(file);

        // Limpiamos el input para permitir subir el mismo archivo si hay error
        e.target.value = null;
    };

    // Cerrar y limpiar modal
    const handleCloseModal = () => {
        setIsUpdateModalOpen(false);
        setExcelData([]);
        setExcelHeaders([]);
        setExcelFileName("");
        setColumnAliases({});
    };

    // Guardar actualización
    const handleSaveUpdate = async () => {
        setIsSaving(true);
        try {
            // 🔥 Aquí llamas a la función padre que se encargará de actualizar Firebase
            // Deberás pasarle la nueva data, los headers y los nuevos aliases.
            if (onUpdateDatabase) {
                await onUpdateDatabase({
                    newData: excelData,
                    newHeaders: excelHeaders,
                    newAliases: columnAliases
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error("Error actualizando BD:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#F3F6F9] p-8">
            <div className="flex items-center justify-between">
                <CustomText variant="bodyX" as="h5" className="font-bold text-[#0E3C42]">
                    Base de Datos de Asambleístas
                </CustomText>

                {/* 🔥 Input oculto conectado a fileInputRef */}
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                />

                <CustomButton
                    variant="primary"
                    // Al hacer clic, disparamos el input de archivo
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 flex items-center gap-2"
                >
                    <CustomIcon path={ICON_PATHS.cloudUpload} size={20} />
                    <CustomText variant="labelL" className="font-bold">
                        Actualizar Base de Datos
                    </CustomText>
                </CustomButton>
            </div>

            <div className="flex items-center gap-2 text-gray-500 mb-6 mt-2">
                <CustomText variant="labelM" className="" >
                    La siguiente base de datos fue cargada el{" "}
                </CustomText>
                {entityData?.createdAt && (
                    <CustomText variant="labelM" className="font-bold bg-[#ABE7E5] text-[#0E3C42] px-2 py-1 rounded-full">
                        {formatIsoDateToShort(entityData.createdAt)}
                    </CustomText>
                )}
            </div>

            {registries.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <CustomText variant="bodyM" className="text-gray-500 font-bold">No hay base de datos cargada.</CustomText>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 bg-[#F3F6F9]">
                                {displayHeaders.map((header, idx) => (
                                    <th key={idx} className="py-4 px-6 font-bold text-[#0E3C42] text-[14px]">
                                        {header.display}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((row) => (
                                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    {displayHeaders.map((header, idx) => (
                                        <td key={idx} className="py-4 px-6 text-[#3D3D44] text-[14px]">
                                            {row[header.display] || row[header.original] || "-"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Paginación */}
            {registries.length > itemsPerPage && (
                <div className="flex justify-end mt-4">
                    {/* ... (tu código de paginación queda igual) ... */}
                    <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30">
                            <ChevronsLeft size={18} />
                        </button>
                        <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30">
                            <ChevronLeft size={18} />
                        </button>
                        <div className="px-4 font-bold text-[#0E3C42] text-sm">
                            Página {currentPage} de {totalPages}
                        </div>
                        <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30">
                            <ChevronRight size={18} />
                        </button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30">
                            <ChevronsRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------
                🔥 MODAL DE ACTUALIZACIÓN CON EXCEL EDITOR
            ----------------------------------------------------- */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Modal */}
                    <div className="bg-[#F8F9FB] w-full rounded-[32px] shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 z-10 overflow-hidden">

                        {/* Header Modal */}
                        <div className="px-8 py-6 border-b border-gray-200 bg-white flex justify-between items-center relative z-20">
                            <div>
                                <CustomText variant="TitleM" className="font-bold text-[#0E3C42]">
                                    Revisión de nueva Base de Datos
                                </CustomText>
                                <CustomText variant="bodyS" className="text-gray-500 mt-1">
                                    Archivo cargado: <span className="font-bold">{excelFileName}</span>
                                </CustomText>
                            </div>
                        </div>

                        {/* Cuerpo Modal (Excel Editor) */}
                        <div className="overflow-y-auto no-scrollbar p-6 flex-1 relative z-10">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <ExcelEditor
                                    data={excelData}
                                    setData={setExcelData}
                                    headers={excelHeaders}
                                    setHeaders={setExcelHeaders}
                                    columnAliases={columnAliases}
                                    setColumnAliases={setColumnAliases}
                                />
                            </div>
                        </div>

                        {/* Footer Modal (Botones) */}
                        <div className="p-6 border-t border-gray-200 bg-white flex items-center justify-end gap-4 relative z-20">
                            <CustomButton
                                variant="secondary"
                                onClick={handleCloseModal}
                                disabled={isSaving}
                                className="px-6 py-3 font-bold"
                            >
                                Cancelar
                            </CustomButton>
                            <CustomButton
                                variant="primary"
                                onClick={handleSaveUpdate}
                                disabled={isSaving}
                                className="px-8 py-3 font-bold shadow-lg shadow-indigo-100"
                            >
                                {isSaving ? "Guardando cambios..." : "Guardar actualización"}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}