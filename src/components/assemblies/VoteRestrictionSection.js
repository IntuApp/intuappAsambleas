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

    const getValue = (item, key) => {
        if (!item) return "-";
        const lowerKey = key.toLowerCase();
        const realKey = Object.keys(item).find(k => k.toLowerCase() === lowerKey);
        return realKey ? item[realKey] : "-";
    };

    // MODIFICACIÓN: El useMemo ahora SOLO filtra por búsqueda y tipo de filtro, 
    // pero no se recalcula agresivamente solo por el cambio de un Set
    const filteredItems = useMemo(() => {
        return registries.filter((item) => {
            const propiedad = String(getValue(item, "propiedad")).toLowerCase();
            const documento = String(getValue(item, "documento")).toLowerCase();
            const grupo = String(getValue(item, "grupo")).toLowerCase();
            const search = searchTerm.toLowerCase();

            const matchesSearch =
                propiedad.includes(search) ||
                documento.includes(search) ||
                grupo.includes(search);

            const isItemBlocked = blockedVoters.has(item.id);
            const matchesFilter =
                !filterType ||
                (filterType === "blocked" && isItemBlocked) ||
                (filterType === "unblocked" && !isItemBlocked);

            return matchesSearch && matchesFilter;
        });
    }, [registries, searchTerm, filterType, blockedVoters]); // Mantenemos blockedVoters para que la lista se actualice si filtramos por "Bloqueados"

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
                            <th className="px-6 py-4 text-center">Tipo</th>
                            <th className="px-6 py-4 text-center">Grupo</th>
                            <th className="px-6 py-4 text-center"># Propiedad</th>
                            <th className="px-6 py-4 text-center">Coeficiente</th>
                            <th className="px-6 py-4 text-center">Documento</th>
                            <th className="px-6 py-4 text-center">Bloquear Voto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-center text-[#333333]">{getValue(item, "tipo")}</td>
                                    <td className="px-6 py-4 text-center text-[#333333]">{getValue(item, "grupo")}</td>
                                    <td className="px-6 py-4 text-center font-bold text-[#0E3C42]">{getValue(item, "propiedad")}</td>
                                    <td className="px-6 py-4 text-center text-[#333333]">{getValue(item, "coeficiente")}</td>
                                    <td className="px-6 py-4 text-center text-[#333333]">{getValue(item, "documento")}</td>
                                    <td
                                        className="px-6 py-4 flex justify-center cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evita que el clic afecte a la fila
                                            onToggleVote(item.id);
                                        }}
                                    >
                                        <ToggleSwitch
                                            checked={blockedVoters.has(item.id)}
                                        />
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