"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Search } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import ToggleSwitch from "@/components/basics/ToggleSwitch";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function VoteRestrictionSection({
  isInAssemblyInfo,
  registries = [],
  blockedVoters = new Set(),
  onToggleVote,
  itemsPerPage = 10,
  assembyStatus,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState(""); // "" | "blocked" | "unblocked"

  const filteredRegistries = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    return registries.filter((item) => {
      // 1. Search Filter
      const matchesSearch = Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchLower),
      );

      if (!matchesSearch) return false;

      // 2. Block Filter
      if (filterType === "blocked") {
        return blockedVoters.has(item.id);
      }
      if (filterType === "unblocked") {
        return !blockedVoters.has(item.id);
      }

      return true;
    });
  }, [registries, searchTerm, filterType, blockedVoters]);

  const totalPages = Math.ceil(filteredRegistries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegistries.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="max-w-[1128px] w-full bg-white border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-6 shadow-soft">
      <CustomText variant="bodyX" as="h5" className="text-[#0E3C42] font-bold">
        {isInAssemblyInfo
          ? "Asambleístas con restricción de voto"
          : "4. Restricción de voto"}
      </CustomText>

      <CustomText variant="bodyM" className="text-[#333333]">
        {isInAssemblyInfo
          ? "Aquí puede marcar a los asambleístas que no tendrán derecho a votar en esta asamblea, por ejemplo, propietarios con cuotas en mora u otras causales establecidas en el reglamento interno del conjunto."
          : "Marque los asambleístas que no tendrán derecho a votar en esta asamblea."}
      </CustomText>

      {/* Alert */}
      <div className="bg-[#FFEDDD] border border-[#F98A56] rounded-lg p-4">
        <div className="flex gap-3">
          <div>
            <CustomText
              variant="bodyM"
              className=" text-[#1F1F23] font-bold flex items-center gap-2"
            >
              <CustomIcon
                path={ICON_PATHS.warning}
                size={20}
                className="text-[#F98A56]"
              />
              Importante
            </CustomText>
            <CustomText variant="bodyM" className="text-[#333333]">
              {isInAssemblyInfo
                ? "La responsabilidad de definir a qué asambleístas se les restringe el voto recae exclusivamente en la administración o funcionario de la entidad. IntuApp no valida las causales de restricción ni asume responsabilidad legal por el uso de esta función."
                : "La responsabilidad de esta configuración recae exclusivamente en la administración."}
            </CustomText>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 w-full">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por torre, propiedad o documento"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select
          className="px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#8B9DFF] transition bg-white"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Ver todos</option>
          <option value="blocked">Bloqueados</option>
          <option value="unblocked">No bloqueados</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-xs font-bold uppercase">
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Grupo</th>
              <th className="px-6 py-4">Propiedad</th>
              <th className="px-6 py-4">Coeficiente</th>
              <th className="px-6 py-4">Documento</th>
              <th className="px-6 py-4 text-center">Bloquear voto</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => {
                const isBlocked = blockedVoters.has(item.id);
                return (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-blue-50/30 text-sm"
                  >
                    <td className="px-6 py-4">{item.tipo || "-"}</td>
                    <td className="px-6 py-4">{item.grupo || "-"}</td>
                    <td className="px-6 py-4 font-medium">
                      {item.propiedad || "-"}
                    </td>
                    <td className="px-6 py-4">{item.coeficiente || "0.00"}</td>
                    <td className="px-6 py-4">{item.documento || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <ToggleSwitch
                        checked={isBlocked}
                        label={isBlocked ? "Sí" : "No"}
                        onChange={() => onToggleVote(item.id, isBlocked)}
                        disabled={assembyStatus === "finished"}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  No se encontraron registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 text-sm">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 disabled:opacity-30"
          >
            Anterior
          </button>
          <span className="font-bold">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 disabled:opacity-30"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
