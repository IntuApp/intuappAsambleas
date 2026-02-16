import React from "react";
import { User, ArrowRight } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import CustomInput from "@/components/basics/inputs/CustomInput";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function Step1Document({
  document,
  setDocument,
  onNext,
  loading,
}) {
  return (
    <div className="flex flex-col gap-[40px] max-w-[455px] w-full items-center">
      <CustomText variant="TitleL" as="h3" className="text-[#0E3C42] font-bold">
        Ingresa tu código
      </CustomText>

      <div className="flex flex-col gap-6 w-full">
        <CustomInput
          variant="labelM"
          label="Código"
          type="text"
          inputMode="numeric"
          placeholder="Escribe aquí tu codigo"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          className="w-full gap-2"
          classLabel="font-bold"
          classInput="bg-[#FFFFFF] rounded-lg border border-[#D3DAE0] px-6 py-5 text-[18px]"
        />
        <div className="bg-[#FFEDDD] border-[#F98A56] border-[1px] rounded-lg py-2 px-4 w-full">
          <CustomText
            variant="bodyM"
            className=" text-[#1F1F23] font-bold flex items-center gap-2"
          >
            <CustomIcon
              path={ICON_PATHS.warning}
              size={20}
              className="text-[#F98A56]"
            />
            Solo números, sin puntos ni espacios
          </CustomText>
        </div>
      </div>
      <CustomButton
        variant="primary"
        onClick={onNext}
        disabled={loading || !document.trim()}
        className="py-4 px-4 font-bold flex items-center gap-2 w-full justify-center"
      >
        {loading ? "Cargando..." : "Continuar"}
      </CustomButton>

      <div className="flex flex-col gap-2 w-full items-center">
        <CustomText
          variant="bodyM"
          className="text-[#3D3D44] font-regular flex items-center gap-2"
        >
          ¿Problemas con tu documento?
        </CustomText>
        <CustomButton
          onClick={onNext}
          disabled={loading}
          className="bg-transparent border-none hover:border-none hover:bg-transparent"
        >
          <CustomText variant="bodyM" className="text-[#4059FF] font-medium underline underline-offset-2">
            Contactar Soporte
          </CustomText>
        </CustomButton>
      </div>
    </div>
  );
}
