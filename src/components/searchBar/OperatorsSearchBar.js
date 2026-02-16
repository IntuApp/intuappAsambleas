"use client";
import React, { useMemo, useState } from "react";
import CustomIcon from "../basics/CustomIcon";
import CustomInput from "../basics/inputs/CustomInput";
import CustomButton from "../basics/CustomButton";
import CustomText from "../basics/CustomText";
import { ICON_PATHS } from "@/constans/iconPaths";
import { colombiaCities } from "@/constans/colombiaCities";

export default function OperatorsSearchBar({
  operators,
  onChange,
  viewMode,
  setViewMode,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUbication, setFilterUbication] = useState("");
  const [sortBy, setSortBy] = useState("");

  const processedOperators = useMemo(() => {
    let result = [...operators];

    if (searchTerm) {
      result = result.filter((operator) =>
        operator.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterUbication) {
      result = result.filter((operator) => operator.city === filterUbication);
    }

    if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [operators, searchTerm, filterUbication, sortBy]);

  // ⬆️ enviar resultado al padre
  React.useEffect(() => {
    onChange(processedOperators);
  }, [processedOperators, onChange]);

  return (
    <div className="bg-[#FFFFFF] max-w-[1128px] max-h-[150px] w-full h-full border border-[#F3F6F9] rounded-3xl flex justify-between p-6">
      <div className="max-w-[770px] w-full flex gap-4 items-center">
        <div className="flex-1 max-w-[416px] flex-start w-full relative group">
          <CustomIcon
            path={ICON_PATHS.search}
            size={24}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D3D44]"
          />
          <CustomInput
            variant="labelL"
            classLabel="text-[#838383]"
            placeholder="Busca por nombre"
            classInput="max-w-[416px] max-h-[50px] w-full pl-12 pr-4 py-3 rounded-xl border"
            className="gap-[0px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="max-w-[200px] max-h-[50px] w-full px-4 py-3 rounded-xl text-[16px] text-[#838383] border appearance-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1em",
          }}
          value={filterUbication}
          onChange={(e) => setFilterUbication(e.target.value)}
        >
          <option value="">Ubicación</option>

          {colombiaCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="max-w-[152px] max-h-[50px] w-full px-4 py-3 rounded-xl text-[16px] text-[#838383] border appearance-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1em",
          }}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Ordenar por</option>
          <option value="name-asc">Nombre (A-Z)</option>
          <option value="name-desc">Nombre (Z-A)</option>
          <option value="recent">Más recientes</option>
        </select>
      </div>

      <div className="flex items-center w-auto ">
        <div className="flex items-center rounded-xl p-1.5 gap-2">
          <CustomButton
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 p-2 rounded-lg font-bold transition-all ${
              viewMode === "grid"
                ? "bg-[#EEF0FF] border border-[#94A2FF] shadow-sm text-[#4059FF]"
                : "bg-[#FFFFFF] border border-[#DBE2E8] shadow-sm text-[#3D3D44]"
            }`}
          >
            <CustomIcon path={ICON_PATHS.layoutGrid} size={16} />
            <CustomText
              variant="labelL"
              className={
                viewMode === "grid" ? "text-[#4059FF]" : "text-[#3D3D44]"
              }
            >
              Vista tarjetas
            </CustomText>
          </CustomButton>
          <CustomButton
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 p-2 rounded-lg font-bold transition-all ${
              viewMode === "list"
                ? "bg-[#EEF0FF] border border-[#94A2FF] shadow-sm text-[#4059FF]"
                : "bg-[#FFFFFF] border border-[#DBE2E8] shadow-sm text-[#3D3D44]"
            }`}
          >
            <CustomIcon path={ICON_PATHS.viewList} size={16} />
            <CustomText
              variant="labelL"
              className={
                viewMode === "list" ? "text-[#4059FF]" : "text-[#3D3D44]"
              }
            >
              Vista lista
            </CustomText>
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
