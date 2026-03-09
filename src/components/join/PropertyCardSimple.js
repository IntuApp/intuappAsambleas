import React from "react";
import CustomText from "@/components/basics/CustomText";
import CustomTypePropertie from "./CustomTypePropertie";

export default function PropertyCardSimple({ registry }) {
  // Normalizamos las llaves del objeto por si vienen del Excel en diferentes formatos
  const tipo = registry.tipo || registry.Tipo || "";
  const propiedad = registry.propiedad || registry.Propiedad || "";
  const coeficiente = registry.coeficiente || registry.Coeficiente || "0";

  return (
    <div className="p-4 rounded-2xl w-full md:max-w-[350px] flex items-center gap-4 border border-[#DBE2E8] bg-white shadow-sm hover:border-[#94A2FF] transition-colors">
      <div className="shrink-0">
        <CustomTypePropertie type={tipo.toLowerCase().trim()} size={24}/>
      </div>
      <div className="flex flex-col text-left overflow-hidden">
        <CustomText variant="bodyM" className="font-bold text-[#0E3C42] truncate">
          {tipo ? `${tipo} ` : ""} {propiedad}
        </CustomText>
        <div className="flex items-center gap-1 mt-0.5">
          <CustomText variant="labelM" className="text-[#838383]">
            Coeficiente:
          </CustomText>
          <CustomText variant="labelM" className="font-bold">
            {String(coeficiente).slice(0, 5)}%
          </CustomText>
        </div>
      </div>
    </div>
  );
}