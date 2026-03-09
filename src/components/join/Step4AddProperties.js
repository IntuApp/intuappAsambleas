"use client";

import React from "react";
import CustomText from "@/components/basics/CustomText";
import CustomOptionSelect from "@/components/basics/CustomOptionSelect";
import CustomButton from "@/components/basics/CustomButton";

export default function Step4AddProperties({
  addAnotherDecision,
  setAddAnotherDecision,
  onContinue,
}) {
  return (
    <div className="flex flex-col items-center md:text-center md:w-[552px] gap-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-2">
        <CustomText variant="TitleL" as="h1" className="text-[#0E3C42] font-bold">
          ¿Quieres añadir  otra propiedad?
        </CustomText>
        <CustomText variant="labelL" className="text-[#3D3D44]">
          Marca si vas a representar a otra propiedad
        </CustomText>
      </div>

      <div className="w-full flex flex-col gap-4">
        <CustomOptionSelect
          value={addAnotherDecision}
          onChange={(v) => setAddAnotherDecision(v)}
          classContentOptions="flex flex-col gap-3"
          options={[
            { label: "Sí, representar otra propiedad", value: "yes" },
            { label: "No, no voy a representar otra", value: "no" },
          ]}
        />
      </div>

      <CustomButton
        variant="primary"
        onClick={onContinue}
        disabled={!addAnotherDecision}
        className="py-5 px-4 font-bold w-full"
      >
        Continuar
      </CustomButton>
    </div>
  );
}