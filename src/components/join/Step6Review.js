"use client";

import React, { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomTypePropertie from "./CustomTypePropertie";
import CustomButton from "@/components/basics/CustomButton";

export default function Step6Review({
  userInfo,
  regDocument,
  verifiedRegistries,
  onRemoveItem,
  onAddAnother,
  onContinue,
  assembly,
}) {
  const ITEMS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(verifiedRegistries.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return verifiedRegistries.slice(start, start + ITEMS_PER_PAGE);
  }, [verifiedRegistries, currentPage]);

  return (
    <div className="flex flex-col  gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center flex flex-col gap-2">
        <CustomText variant="TitleL" as="h3" className="text-[#0E3C42] font-bold">
          Propiedades identificadas
        </CustomText>
        <CustomText variant="labelL" className="text-[#3D3D44]">
          Vas a representar las siguientes porpiedades:
        </CustomText>
      </div>

      <div className=" flex flex-col gap-6">
        {/* Info Personal */}
        <div className="flex flex-col gap-3">
          <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
            Información personal
          </CustomText>
          <div className="bg-white shadow-soft border border-gray-100 rounded-2xl py-3 pl-3 pr-8 flex items-center gap-5 md:max-w-fit">
            <div className="p-2 bg-[#EEF0FF] rounded-full">
              <CustomIcon path={ICON_PATHS.accountCircle} size={40} className="text-[#6A7EFF]" />
            </div>
            <div className="flex flex-col">
              <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
                {userInfo.firstName} {userInfo.lastName}
              </CustomText>
              <CustomText variant="bodyS" className="font-medium text-[#838383]">
                Código de ingreso: {regDocument}
              </CustomText>
            </div>
          </div>
        </div>

        {/* Propiedades */}
        <div className="flex flex-col gap-3 w-full md:w-[738px]">
          <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
            Propiedades
          </CustomText>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedItems.map((item, i) => {
              const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + i;
              return (
                <div key={realIndex} className=" w-full border border-[#DBE2E8] shadow-soft p-3 rounded-2xl flex items-center gap-4 ">
                  <CustomTypePropertie type={(item.registry.tipo || item.registry.Tipo || "").toLowerCase()} />

                  <div className="flex-1 min-w-0">
                    {item.registry.grupo && (
                      <CustomText variant="bodyM" className="font-bold text-[#1F1F23] truncate">
                        {item.registry.grupo || item.registry.Grupo}
                      </CustomText>
                    )}
                    <CustomText variant="bodyM" className="font-bold text-[#1F1F23] truncate">
                      {item.registry.propiedad || item.registry.Propiedad}
                    </CustomText>

                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className={`text-[14px] font-semibold px-2 py-0.5 rounded-full ${item.role === "owner" ? "text-[#0E3C42] bg-[#B8EAF0]" : "text-[#00093F] bg-[#D5DAFF]"
                        }`}>
                        {item.role === "owner" ? "Propietario" : "Apoderado"}
                      </span>
                      <CustomText variant="bodyS" className="text-[#838383] text-[12px]">
                        Coeficiente: <strong>{(item.registry.coeficiente || item.registry.Coeficiente || "0").toString().slice(0, 4)}%</strong>
                      </CustomText>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.powerFile && <FileText size={18} className="text-[#6A7EFF]" />}
                    {item.isManual && (
                      <CustomButton variant="primary" onClick={() => onRemoveItem(realIndex)} className="p-2 ">
                        <CustomIcon path={ICON_PATHS.delete} size={18} />
                      </CustomButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación interna */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-2 h-2 rounded-full transition-all ${currentPage === idx + 1 ? "bg-[#6A7EFF] w-4" : "bg-gray-300"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-row md:flex-row items-center justify-center gap-4 w-full">
        {assembly.canAddOtherRepresentatives && (
          <CustomButton
            variant="secondary"
            onClick={onAddAnother}
            className="font-bold px-4 py-3"
          >
            Añadir otra propiedad
          </CustomButton>
        )}
        <CustomButton
          variant="primary"
          onClick={onContinue}
          className="font-bold px-6 py-3"
        >
          Continuar
        </CustomButton>
      </div>
    </div>
  );
}