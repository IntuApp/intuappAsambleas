"use client";
import React, { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomTypePropertie from "../CustomTypePropertie";
import CustomButton from "@/components/basics/CustomButton";

export default function Step5Review({
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
    <div className="flex flex-col max-w-[902px] w-full">
      {/* Header */}
      <div className="text-center">
        <CustomText
          variant="TitleL"
          as="h3"
          className="text-[#0E3C42] font-bold"
        >
          Propiedades identificadas
        </CustomText>
        <CustomText variant="labelL" className="text-[#1F1F23]">
          Vas a representar las siguientes propiedades:
        </CustomText>
      </div>

      {/* Card */}
      <div className="bg-white p-6 rounded-[40px] ">
        {/* Info Personal */}
        <CustomText
          variant="bodyX"
          as="h5"
          className="font-bold text-[#0E3C42]"
        >
          Información personal
        </CustomText>

        <div className="shadow-soft border border-gray-100 rounded-2xl p-5 flex items-center gap-5 mb-4 max-w-[406px]">
          <div className="p-2 bg-[#EEF0FF] rounded-full">
            <CustomIcon
              path={ICON_PATHS.accountCircle}
              size={40}
              className="text-[#6A7EFF]"
            />
          </div>
          <div>
            <CustomText
              variant="bodyX"
              as="h5"
              className="font-bold text-[#0E3C42]"
            >
              {userInfo.firstName} {userInfo.lastName}
            </CustomText>
            <CustomText variant="bodyS" className="font-medium text-[#0E3C42]">
              Código de ingreso: {regDocument}
            </CustomText>
          </div>
        </div>

        {/* Propiedades */}
        <CustomText
          variant="bodyX"
          as="h5"
          className="font-bold text-[#0E3C42]"
        >
          Propiedades
        </CustomText>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {paginatedItems.map((item, i) => {
            const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + i;

            return (
              <div
                key={realIndex}
                className="max-w-[406px] border border-gray-100 p-6 rounded-[24px] flex items-center gap-4 relative hover:border-blue-200 transition-all"
              >
                <CustomTypePropertie type={item.registry.tipo} />

                <div className="flex-1 min-w-0">
                  <CustomText
                    variant="bodyM"
                    as="h5"
                    className="font-bold text-[#1F1F23]"
                  >
                    {item.registry.propiedad}
                  </CustomText>

                  <div className="flex items-center gap-2 flex-wrap">
                    <CustomText
                      variant="bodyS"
                      className={`font-medium px-2 py-0.5 rounded-full ${
                        item.role === "owner"
                          ? "text-[#0E3C42] bg-[#B8EAF0]"
                          : "text-[#00093F] bg-[#D5DAFF]"
                      }`}
                    >
                      {item.role === "owner" ? "Propietario" : "Apoderado"}
                    </CustomText>

                    <CustomText variant="bodyS">
                      Coeficiente:{" "}
                      <strong className="text-gray-600">
                        {item.registry.coeficiente.slice(0, 4)}%
                      </strong>
                    </CustomText>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {item.isManual && (
                    <CustomButton
                      onClick={() => onRemoveItem(realIndex)}
                      className="p-2 rounded-full"
                      variant="primary"
                    >
                      <CustomIcon path={ICON_PATHS.delete} size={20} />
                    </CustomButton>
                  )}

                  {item.powerFile && (
                    <FileText size={16} className="text-[#8B9DFF]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="text-sm disabled:opacity-40"
            >
              Anterior
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isActive = page === currentPage;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-sm transition-all ${
                    isActive
                      ? "bg-[#B8EAF0] text-[#0E3C42] font-bold"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="text-sm disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {assembly.powerLimit <= verifiedRegistries.length && (
        <CustomText variant="bodyM" className="text-[#0E3C42] font-bold">
          Ya has añadido todas las propiedades que puedes representar.
        </CustomText>
      )}

      {/* Footer Buttons */}
      <div className="flex items-center justify-center gap-4 mt-2">
        {assembly.canAddOtherRepresentatives && (
          <CustomButton
            disabled={assembly.powerLimit <= verifiedRegistries.length}
            variant="secondary"
            onClick={onAddAnother}
            className="p-3"
          >
            <CustomText variant="bodyM" className="text-[#0E3C42] font-bold">
              Añadir otra propiedad
            </CustomText>
          </CustomButton>
        )}
        <CustomButton
          variant="primary"
          onClick={onContinue}
          className="py-3 px-10"
        >
          <CustomText variant="bodyM" className="text-black font-bold">
            Continuar
          </CustomText>
        </CustomButton>
      </div>
    </div>
  );
}
