"use client";
import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function EntityDatabaseManager({ entityData, registries = [] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Cantidad de asambleístas por página

    // 1. Extraemos los headers para pintar las columnas.
    // Priorizamos los alias guardados en la BD, si no, usamos las llaves crudas del primer registro.
    const displayHeaders = useMemo(() => {
        if (registries.length === 0) return [];

        // Si la entidad tiene headers guardados, usamos esos ordenados
        if (entityData?.headers && entityData.headers.length > 0) {
            return entityData.headers.map(header => ({
                original: header,
                display: entityData.columnAliases?.[header] || header
            }));
        }

        // Fallback: Sacamos las llaves del primer registro (excluyendo 'id')
        const firstRegKeys = Object.keys(registries[0]).filter(k => k !== 'id');
        return firstRegKeys.map(key => ({ original: key, display: key }));
    }, [registries, entityData]);

    // 2. Lógica de Paginación
    const totalPages = Math.max(1, Math.ceil(registries.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = registries.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-[#FFFFFF] max-w-[1128px] rounded-3xl border border-[#F3F6F9] p-8">
            <div className="flex items-center justify-between">
                <CustomText variant="bodyX" as="h5" className="font-bold text-[#0E3C42]">
                    Base de Datos de Asambleístas
                </CustomText>
                <CustomButton
                    variant="primary"
                    className="px-3 py-2 flex items-center gap-2"
                >
                    <CustomIcon path={ICON_PATHS.cloudUpload} size={20} />
                    <CustomText variant="labelL" className="font-bold">
                        Actualizar Base de Datos
                    </CustomText>
                </CustomButton>
            </div>

            <div className="flex items-center gap-2 text-gray-500 mb-6">
                <CustomText variant="labelM" className="" >
                    La siguiente base de datos fue cargada el{" "}

                </CustomText>
                <CustomText variant="labelM" className="font-bold bg-[#ABE7E5] text-[#0E3C42] px-2 py-1 rounded-full">
                    {new Date(entityData.createdAt).toLocaleDateString()}
                </CustomText></div>
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

                        <div className="px-4 font-bold text-[#0E3C42] text-sm">
                            Página {currentPage} de {totalPages}
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
                            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30"
                        >
                            <ChevronsRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}