"use client";
import React, { useState } from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import EntityCard from "./EntityCard";
import Button from "@/components/basics/Button";

export default function EntitiesList({
  entities = [],
  onCreateEntity,
  onManageEntity,
  onCreateAssembly,
}) {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  const filteredEntities = entities.filter(
    (entity) =>
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filterType || entity.type === filterType)
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Busca por nombre"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {/* Type Filter */}
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tipo</option>
            <option value="Propiedad Horizontal">Residencial</option>
            <option value="Empresarial">Empresarial</option>
            <option value="Mixto">Mixto</option>
          </select>

          {/* Sort Toggle (Mocked) */}
          <select className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 bg-white">
            <option>Ordenar por</option>
            <option>Nombre (A-Z)</option>
            <option>Más recientes</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {filteredEntities.length > 0 ? (
        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {filteredEntities.map((entity) => (
            <div
              key={entity.id}
              className={viewMode === "list" ? "w-full" : "h-full"}
            >
              {/* 
                   If list view is strictly required to look like a table row, we'd need a separate component.
                   For now, we will just stack cards full width in list mode or keep grid.
                   The prompt image shows 'Vista tarjetas' active.
                */}
              <EntityCard
                entity={entity}
                onManage={onManageEntity}
                onCreateAssembly={onCreateAssembly}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
          <p className="text-gray-500">No se encontraron entidades.</p>
          {onCreateEntity && (
            <Button
              variant="primary"
              size="M"
              className="mt-4"
              onClick={onCreateEntity}
            >
              Crear nueva entidad
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
