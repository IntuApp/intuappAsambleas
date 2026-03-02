"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EntitiesSearchBar from "../searchBar/EntitiesSearchBar";
import EntityCard from "./EntityCard"; // Importamos tu tarjeta
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton"; // Asegúrate de tenerlo importado para la tabla
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import { getTypeName } from "@/lib/utils";

export default function EntitiesList({ entities = [], operatorId, isOperator }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("grid");
  const [processedEntities, setProcessedEntities] = useState(entities);

  useEffect(() => {
    setProcessedEntities(entities);
  }, [entities]);

  return (
    <div className="space-y-6 w-full h-full">
      <EntitiesSearchBar
        entities={entities}
        onChange={setProcessedEntities}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* RENDERIZADO DE LAS TARJETAS (GRID) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {processedEntities.map((entity) => {
            // Extracción y mapeo de datos para la EntityCard
            const city = entity.city || entity.adminEntity?.city || "Sin ciudad";
            const address = entity.address || "Sin dirección";
            // Tomamos el número que guardamos al crearla (o 0 si es antigua)
            const asambleistasCount = entity.totalRegistries || 0; 

            // Construimos el objeto props que tu EntityCard espera
            const cardProps = {
              ...entity,
              city,
              address,
              asambleistasCount,
              
              // MOCK de Asambleas: (Deberías cruzarlos con tu colección 'assembly')
              // nextAssembly: { date: '15 Oct', time: '3:30 PM' }, 
              // activeAssembly: { name: 'Asamblea Ordinaria', hour: '30 minutos' }, 
              // hasAssemblies: true,
              
              pendingDb: entity.databaseStatus === "pending" || !entity.assemblyRegistriesListId
            };

            return (
              <EntityCard
                key={entity.id}
                entity={cardProps}
                onManage={() => isOperator ? router.push(`/operario/${entity.id}`) : router.push(`/admin/operadores/${operatorId}/${entity.id}`)}
                onCreateAssembly={() => isOperator ? router.push(`/operario/${entity.id}/crear-asamblea`) : router.push(`/admin/operadores/${operatorId}/${entity.id}/crear-asamblea`)}
                onViewAssembly={() => {
                  const targetAssemblyId = cardProps.activeAssembly?.id || "default";
                  router.push(`/admin/operadores/${operatorId}/${entity.id}/${targetAssemblyId}`);
                }}
              />
            );
          })}
        </div>
      ) : (
        /* VISTA DE LISTA (Tabla) */
        <div className="bg-white rounded-[24px] border border-[#F3F6F9] overflow-hidden w-full shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-gray-100 bg-white">
              <tr>
                <th className="py-4 px-6 font-bold text-[#0E3C42] text-[16px]">Entidad</th>
                <th className="py-4 px-6 font-bold text-[#0E3C42] text-[16px]">Tipo</th>
                <th className="py-4 px-6 font-bold text-[#0E3C42] text-[16px]">Ubicación</th>
                <th className="py-4 px-6 font-bold text-[#0E3C42] text-[16px]">Asambleístas</th>
                <th className="py-4 px-6 font-bold text-[#0E3C42] text-[16px] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {processedEntities.map((entity) => {
                const city = entity.city || entity.adminEntity?.city || "Sin ciudad";
                const asambleistasCount = entity.totalRegistries || 0;

                return (
                  <tr key={entity.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-6 font-bold text-[#0E3C42] text-[14px]">
                      {entity.name}
                    </td>
                    <td className="py-5 px-6 text-[#838383] text-[14px]">
                      {getTypeName(entity.typeID)}
                    </td>
                    <td className="py-5 px-6 text-[#838383] text-[14px]">
                      {city}
                    </td>
                    <td className="py-5 px-6 text-[#838383] text-[14px]">
                      {asambleistasCount}
                    </td>
                    <td className="py-5 px-6 flex justify-center">
                       {/* Botón redondo para la vista de tabla */}
                       <button 
                          onClick={() => router.push(`/admin/operadores/${operatorId}/${entity.id}`)}
                          className="w-10 h-10 flex justify-center items-center bg-[#94A2FF] text-[#00093F] rounded-full hover:bg-[#8090ff] transition-all"
                        >
                          <CustomIcon path={ICON_PATHS.settings || "M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"} size={20} />
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}