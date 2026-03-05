"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import CustomIcon from "@/components/basics/CustomIcon";
import ToggleSwitch from "@/components/basics/ToggleSwitch";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function VoteRestrictionSection({
    registries = [],
    blockedVoters,
    onToggleVote,
    isInAssemblyInfo = false
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Función de obtención de valor (robusta)
    const getValue = (item, key) => {
        if (!item) return null;
        const searchKey = key.toLowerCase().trim();
        const realKey = Object.keys(item).find(k => k.toLowerCase().trim().includes(searchKey));
        const value = realKey ? item[realKey] : null;

        if (value === undefined || value === null || value === "") return null;

        // --- NUEVA LÓGICA DE FORMATEO PARA COEFICIENTE ---
        if (searchKey === "coeficiente") {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                // toFixed(4) asegura que solo veas 4 decimales. 
                // parseFloat de nuevo quita ceros sobrantes al final (ej: 0.5500 -> 0.55)
                return parseFloat(num.toFixed(2)).toString();
            }
        }

        return String(value);
    };

    // 1. Filtrado de items
    const filteredItems = useMemo(() => {
        return registries.filter((item) => {
            const prop = getValue(item, "propiedad")?.toLowerCase() || "";
            const doc = getValue(item, "documento")?.toLowerCase() || "";
            const grupo = getValue(item, "grupo")?.toLowerCase() || "";
            const search = searchTerm.toLowerCase();

            const matchesSearch = prop.includes(search) || doc.includes(search) || grupo.includes(search);
            const isBlocked = blockedVoters.has(item.id);
            const matchesFilter = !filterType ||
                (filterType === "blocked" && isBlocked) ||
                (filterType === "unblocked" && !isBlocked);

            return matchesSearch && matchesFilter;
        });
    }, [registries, searchTerm, filterType, blockedVoters]);

    // 2. DETERMINAR COLUMNAS VISIBLES
    // Solo se muestran si al menos UN registro tiene datos en esa columna
    const visibleColumns = useMemo(() => {
        const potentialColumns = [
            { id: "tipo", label: "Tipo" },
            { id: "grupo", label: "Grupo" },
            { id: "propiedad", label: "# Propiedad" },
            { id: "coeficiente", label: "Coeficiente" },
            { id: "documento", label: "Documento" },
        ];

        return potentialColumns.filter(col =>
            filteredItems.some(item => getValue(item, col.id) !== null)
        );
    }, [filteredItems]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="w-full bg-white border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
            <CustomText variant="bodyX" as="h5" className="text-[#0E3C42] font-bold">
                {isInAssemblyInfo ? "Asambleístas con restricción de voto" : "4. Restricción de voto"}
            </CustomText>
            <CustomText variant="bodyM" className="text-[#333333] font-regular">En este paso puede marcar a los asambleístas que no tendrán derecho a votar en esta asamblea, por ejemplo, propietarios con cuotas en mora u otras causales establecidas en el reglamento interno del conjunto.</CustomText>

            {/* Alert */}
            <div className="bg-[#FFEDDD] border border-[#F98A56] rounded-lg p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <CustomIcon path={ICON_PATHS.warning} className="text-[#F98A56]" size={20} />
                    <CustomText variant="bodyM" className="text-[#333333] font-bold">Importante</CustomText>
                </div>
                <CustomText variant="bodyM" className="text-[#333333] pl-8 text-sm">
                    La responsabilidad de definir las restricciones recae exclusivamente en la administración.
                </CustomText>
            </div>

            {/* Buscador */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por torre, propiedad o documento"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none focus:border-[#94A2FF]"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <select
                    className="border rounded-xl px-4 text-sm outline-none bg-white cursor-pointer"
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                >
                    <option value="">Ver todos</option>
                    <option value="blocked">Bloqueados</option>
                    <option value="unblocked">No bloqueados</option>
                </select>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto  min-h-[300px]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-[10px] font-bold uppercase text-[#838383]">
                        <tr>
                            {visibleColumns.map(col => (
                                <th key={col.id} className="px-6 py-4 text-center">{col.label}</th>
                            ))}
                            <th className="px-6 py-4 text-center">Bloquear Voto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    {visibleColumns.map(col => (
                                        <td key={col.id} className={`px-6 py-4 text-center ${col.id === 'propiedad' ? 'font-bold text-[#0E3C42]' : 'text-[#333333]'}`}>
                                            {getValue(item, col.id) || "-"}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 flex justify-center cursor-pointer" onClick={() => onToggleVote(item.id)}>
                                        <ToggleSwitch checked={blockedVoters.has(item.id)} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-10 text-center text-gray-400 italic">
                                    No se encontraron registros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-end items-center gap-4 text-sm font-bold text-[#0E3C42]">
                    <button
                        className="disabled:opacity-30 cursor-pointer"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        Anterior
                    </button>
                    <span className="bg-[#EEF0FF] px-4 py-2 rounded-full text-xs">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        className="disabled:opacity-30 cursor-pointer"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}