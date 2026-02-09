"use client";
import React, { useState, useMemo, useEffect } from "react";

import EntityCard from "./EntityCard";
import CustomIcon from "../basics/CustomIcon";
import CustomButton from "../basics/CustomButton";
import CustomText from "../basics/CustomText";
import { ICON_PATHS } from "@/constans/iconPaths";
import { formatDate, getIconPath, getTypeName } from "@/lib/utils";

const ITEMS_PER_PAGE = 6;

export default function EntityList({
  viewMode,
  entities = [],
  onManageEntity,
  onCreateAssembly,
  onViewAssembly,
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(entities.length / ITEMS_PER_PAGE));

  // 🔹 Reset cuando cambian datos o vista
  useEffect(() => {
    setPage(1);
  }, [viewMode, entities]);

  // 🔹 Protección extra
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedEntities = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return entities.slice(start, start + ITEMS_PER_PAGE);
  }, [entities, page]);

  console.log("entities:", entities.length);
  console.log("totalPages:", totalPages);
  console.log("page:", page);

  /* ===========================
     GRID VIEW
  ============================ */
  if (viewMode === "grid") {
    return (
      <div className="max-w-[1128px] w-full">
        <div className="flex flex-wrap gap-6">
          {paginatedEntities.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              onManage={onManageEntity}
              onCreateAssembly={onCreateAssembly}
              onViewAssembly={onViewAssembly}
            />
          ))}
        </div>

        <div className="w-full flex justify-end">
          {totalPages > 1 && (
            <div className=" flex items-center gap-2 py-8">
              {page > 1 && (
                <CustomButton
                  variant=""
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 bg-[#FFFFFF] border border-[#F3F6F9]  rounded-l-3xl rounded-r-3xl hover:bg-[#ABE7E5] hover:border-[#0E3C42] hover:text-[#0E3C42] !text-[#000000] transition-colors"
                >
                  <CustomText
                    variant="labelL"
                    className="font-bold text-[#000000]"
                  >
                    Anterior
                  </CustomText>
                </CustomButton>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isActive = p === page;

                return (
                  <CustomButton
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-4 py-2 rounded-3xl border transition-colors ${
                      isActive
                        ? "bg-[#ABE7E5] border-[#ABE7E5] text-[#0E3C42]"
                        : "bg-[#F3F6F9] border-[#F3F6F9] text-[#000000] hover:bg-[#ABE7E5] "
                    }`}
                  >
                    <CustomText
                      variant="labelL"
                      className={`font-bold ${
                        isActive ? "text-[#0E3C42]" : "text-[#000000]"
                      }`}
                    >
                      {p}
                    </CustomText>
                  </CustomButton>
                );
              })}

              <CustomButton
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-[#FFFFFF] border border-[#F3F6F9]  rounded-l-3xl rounded-r-3xl hover:bg-[#ABE7E5] hover:border-[#0E3C42] hover:text-[#0E3C42] !text-[#000000] transition-colors"
              >
                <CustomText
                  variant="labelL"
                  className="font-bold text-[#000000]"
                >
                  Siguiente
                </CustomText>
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ===========================
     TABLE VIEW
  ============================ */
  return (
    <div>
      <div className="bg-white rounded-3xl border border-[#D3DAE0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#D3DAE0]">
                {[
                  "Tipo",
                  "Nombre",
                  "Asambleístas",
                  "Ubicación",
                  "Próxima asamblea",
                  "Hora",
                  "Acciones",
                ].map((h) => (
                  <th key={h} className="py-5 px-4 text-center">
                    <CustomText
                      variant="labelL"
                      className="font-bold text-[#0E3C42]"
                    >
                      {h}
                    </CustomText>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedEntities.map((entity) => (
                <tr
                  key={entity.id}
                  className="border-b last:border-none hover:bg-gray-50/50"
                >
                  <td className="py-4 px-8">
                    <div className="w-10 h-10 rounded-full bg-[#D5DAFF] flex items-center justify-center">
                      <CustomIcon path={getIconPath(entity)} size={24} />
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <CustomText variant="labelM" className="font-medium">
                      {getTypeName(entity)}
                    </CustomText>
                    <CustomText variant="labelM">{entity.name}</CustomText>
                  </td>

                  <td className="py-4 px-4 text-center">
                    {entity.asambleistasCount || 0}
                  </td>

                  <td className="py-4 px-4 text-center">
                    {entity.address ? `${entity.address}, ` : ""}
                    {entity.city}
                  </td>

                  <td className="py-4 px-4 text-center">
                    {entity.activeAssembly ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#FACCCD] text-[#930002] px-3 py-1 rounded-full text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 bg-[#930002] rounded-full animate-pulse" />
                        En vivo
                      </span>
                    ) : entity.nextAssembly ? (
                      formatDate(entity.nextAssembly.date)
                    ) : (
                      "No hay"
                    )}
                  </td>

                  <td className="py-4 px-4 text-center">
                    {entity.activeAssembly
                      ? `Inició hace ${entity.activeAssembly.startedAgo}`
                      : entity.nextAssembly?.time || "-"}
                  </td>

                  <td className="py-4 px-8">
                    <div className="flex justify-center gap-3">
                      <CustomButton
                        variant="secondary"
                        className="p-2 rounded-full border-2"
                        onClick={() =>
                          entity.activeAssembly
                            ? onViewAssembly(entity)
                            : onCreateAssembly(entity)
                        }
                      >
                        <CustomIcon
                          path={
                            entity.activeAssembly
                              ? ICON_PATHS.eye
                              : ICON_PATHS.add
                          }
                          size={20}
                        />
                      </CustomButton>

                      <CustomButton
                        variant="primary"
                        className="p-2 rounded-full"
                        onClick={() => onManageEntity(entity)}
                      >
                        <CustomIcon path={ICON_PATHS.settings} size={20} />
                      </CustomButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-full flex justify-end">
        {totalPages > 1 && (
          <div className=" flex items-center gap-2 py-8">
            {page > 1 && (
              <CustomButton
                variant=""
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-[#FFFFFF] border border-[#F3F6F9]  rounded-l-3xl rounded-r-3xl hover:bg-[#ABE7E5] hover:border-[#0E3C42] hover:text-[#0E3C42] !text-[#000000] transition-colors"
              >
                <CustomText
                  variant="labelL"
                  className="font-bold text-[#000000]"
                >
                  Anterior
                </CustomText>
              </CustomButton>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isActive = p === page;

              return (
                <CustomButton
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-4 py-2 rounded-3xl border transition-colors ${
                    isActive
                      ? "bg-[#ABE7E5] border-[#ABE7E5] text-[#0E3C42]"
                      : "bg-[#F3F6F9] border-[#F3F6F9] text-[#000000] hover:bg-[#ABE7E5] "
                  }`}
                >
                  <CustomText
                    variant="labelL"
                    className={`font-bold ${
                      isActive ? "text-[#0E3C42]" : "text-[#000000]"
                    }`}
                  >
                    {p}
                  </CustomText>
                </CustomButton>
              );
            })}

            <CustomButton
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-[#FFFFFF] border border-[#F3F6F9]  rounded-l-3xl rounded-r-3xl hover:bg-[#ABE7E5] hover:border-[#0E3C42] hover:text-[#0E3C42] !text-[#000000] transition-colors"
            >
              <CustomText variant="labelL" className="font-bold text-[#000000]">
                Siguiente
              </CustomText>
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
}
