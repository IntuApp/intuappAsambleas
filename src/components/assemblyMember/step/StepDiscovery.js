import React from "react";
import PropertyCardSimple from "./PropertyCardSimple";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";

export default function StepDiscovery({ verificationQueue, onContinue }) {
  return (
    <div className="flex flex-col items-center text-center max-w-[455px] w-full gap-6">
      <div>
        <CustomText variant="TitleL" as="h3" className="text-[#0E3C42] font-bold">
          Propiedades identificadas
        </CustomText>
        <CustomText variant="labelL" className="text-medium">
          Vas a representar las siguientes propiedades:
        </CustomText>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 w-full">
        {verificationQueue.map((reg, i) => (
          <PropertyCardSimple key={i} registry={reg} />
        ))}
      </div>
      <CustomButton
        variant="primary"
        onClick={onContinue}
        className="py-4 px-4 font-bold flex items-center gap-2 w-full justify-center"
      >
        Continuar
      </CustomButton>
    </div>
  );
}
