"use client";

import React from "react";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import PropertyCardSimple from "./PropertyCardSimple";

export default function StepDiscovery({ verificationQueue, onContinue }) {
  return (
    <div className="flex flex-col items-center text-center w-[552px] gap-10 animate-in fade-in zoom-in-95 duration-500 gap-8">
      <div className="flex flex-col gap-2">
        <CustomText variant="TitleL" as="h3" className="text-[#0E3C42] font-bold">
          Propiedades identificadas
        </CustomText>
        <CustomText variant="bodyL" className="text-[#3D3D44]">
          Vas a representar las siguientes porpiedades:
        </CustomText>
      </div>

      {/* Contenedor de Cards con scroll si hay muchas */}
      <div className="flex flex-wrap items-center justify-center gap-4 w-full max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
        {verificationQueue.map((reg, i) => (
          <PropertyCardSimple key={reg.id || i} registry={reg} />
        ))}
      </div>

      <div className="w-full max-w-[455px]">
        <CustomButton
          variant="primary"
          onClick={onContinue}
          className="py-4 w-full font-bold "
        >
          continuar
        </CustomButton>

       
      </div>
    </div>
  );
}