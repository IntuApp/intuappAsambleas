"use client";
import CustomIcon from "../basics/CustomIcon";
import CustomInput from "../basics/CustomInput";
import { ICON_PATHS } from "@/app/constans/iconPaths";

export default function AssemblySearchBar({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="bg-white w-full flex gap-4 w-[1080px]">
      {/* Buscar */}
      <div className="flex-1 relative max-w-[726px] max-h-[56px] w-full h-full">
        <CustomIcon
          path={ICON_PATHS.search}
          size={24}
          className="absolute left-4 top-1/2 -translate-y-1/3 text-[#3D3D44]"
        />
        <CustomInput
          placeholder="Buscar asamblea por nombre"
          classInput="w-full pl-12 pr-4 py-3 rounded-xl border"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Tipo */}
      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        className="min-w-[150px] px-4 py-3 rounded-xl border text-[#838383] appearance-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
          backgroundSize: "1em",
        }}
      >
        <option value="">Tipo</option>
        <option value="Presencial">Presencial</option>
        <option value="Virtual">Virtual</option>
        <option value="Mixta">Mixta</option>
      </select>

      {/* Estado */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="min-w-[150px] px-4 py-3 rounded-xl border text-[#838383] appearance-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
          backgroundSize: "1em",
        }}
      >
        <option value="">Estado</option>
        <option value="create">Agendada</option>
        <option value="started">En vivo</option>
        <option value="finished">Finalizada</option>
      </select>
    </div>
  );
}
