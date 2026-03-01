"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import CustomIcon from "@/components/basics/CustomIcon";
import ToggleSwitch from "@/components/basics/ToggleSwitch";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function LiveVoteRestrictionManager({
    registries = [],
    blockedProperties = [],
    onToggleBlock,
    isFinished = false,
    entityHeaders = [], // Array 'headers' de la colección entity
    columnAliases = {}  // Objeto 'columnAliases' de la colección entity
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 40;

    // Helper para obtener el valor real buscando la llave original en el objeto del registro
    const getValue = (item, key) => {
        if (!item) return "-";

        // Si la llave que buscamos es "id", la devolvemos directamente
        if (key.toLowerCase() === "id") return item.id || "-";

        const lowerKey = key.toLowerCase();
        const realKey = Object.keys(item).find(k => k.toLowerCase() === lowerKey);
        const val = realKey ? item[realKey] : "-";

        if (lowerKey === "coeficiente" && val !== "-") {
            const num = parseFloat(val);
            return isNaN(num) ? val : num.toFixed(2);
        }
        return val;
    };
    const blockedSet = useMemo(() => new Set(blockedProperties), [blockedProperties]);

    const filteredItems = useMemo(() => {
        return registries.filter((item) => {
            // Buscamos en todas las propiedades del objeto para que la búsqueda sea global
            const itemValues = Object.values(item).join(" ").toLowerCase();
            const search = searchTerm.toLowerCase();

            const matchesSearch = itemValues.includes(search);
            const isBlocked = blockedSet.has(item.id);

            const matchesFilter =
                !filterType ||
                (filterType === "blocked" && isBlocked) ||
                (filterType === "unblocked" && !isBlocked);

            return matchesSearch && matchesFilter;
        });
    }, [registries, searchTerm, filterType, blockedSet]);

    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    return (
        <div className="w-full bg-white border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-6 shadow-soft mt-8">
            <div className="flex flex-col gap-2">
                <CustomText variant="bodyX" as="h5" className="text-[#0E3C42] font-bold">
                    Asambleístas con restricción de voto
                </CustomText>
                <CustomText variant="bodyM" className="text-[#333333]">
                    Marque a los asambleístas que no tendrán derecho a votar. Los cambios se sincronizan en tiempo real con la base de datos.
                </CustomText>
            </div>

            <div className="bg-[#FFEDDD] border border-[#F98A56] rounded-lg p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <CustomIcon path={ICON_PATHS.warning} className="text-[#F98A56]" size={20} />
                    <CustomText variant="bodyM" className="text-[#333333] font-bold">Importante</CustomText>
                </div>
                <CustomText variant="bodyM" className="text-[#333333] pl-8 text-sm">
                    La responsabilidad de estas restricciones recae exclusivamente en la administración. IntuApp no asume responsabilidad legal por el uso de esta función.
                </CustomText>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar en la base de datos..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#94A2FF]"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <select
                    className="border border-gray-200 rounded-xl px-4 text-sm outline-none bg-white cursor-pointer"
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                >
                    <option value="">Ver todos</option>
                    <option value="blocked">Bloqueados</option>
                    <option value="unblocked">Sin restricción</option>
                </select>
            </div>

            <div className="overflow-hidden border border-gray-100 rounded-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8FAFC]">
                        <tr className="text-[11px] font-bold uppercase text-[#838383]">
                            {/* RENDERIZADO DINÁMICO DE HEADERS */}
                            {entityHeaders.map((headerKey, index) => (
                                <th key={index} className="px-6 py-4">
                                    {columnAliases[headerKey] || headerKey}
                                </th>
                            ))}
                            <th className="px-6 py-4 text-center">Bloquear Voto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                {/* RENDERIZADO DINÁMICO DE CELDAS */}
                                {entityHeaders.map((headerKey, index) => (
                                    <td key={index} className={`px-6 py-4 text-sm ${headerKey.toLowerCase().includes('propiedad') ? 'font-bold text-[#0E3C42]' : 'text-[#333333]'}`}>
                                        {getValue(item, headerKey)}
                                    </td>
                                ))}
                                <td
                                    className="px-6 py-4 flex justify-center cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isFinished) return;

                                        // 🔥 CRÍTICO: Asegurarnos de que el ID exista antes de llamar a la función
                                        const propertyId = item.id;

                                        if (!propertyId) {
                                            console.error("Error: El registro no tiene un ID válido", item);
                                            return;
                                        }

                                        const isCurrentBlocked = blockedSet.has(propertyId);

                                        // Enviamos el ID real al padre
                                        onToggleBlock(propertyId, !isCurrentBlocked);
                                    }}
                                >
                                    <ToggleSwitch checked={blockedSet.has(item.id)} disabled={isFinished} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-end items-center gap-4 text-xs font-bold">
                    <button className="disabled:opacity-30" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
                    <span className="bg-gray-100 px-3 py-1 rounded-md">{currentPage} / {totalPages}</span>
                    <button className="disabled:opacity-30" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Siguiente</button>
                </div>
            )}
        </div>
    );
}