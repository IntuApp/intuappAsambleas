import React from "react";
import CustomText from "@/components/basics/CustomText";
import CustomInput from "@/components/basics/CustomInput";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function Step1Document({
  document,
  setDocument,
  onNext,
  loading,
  label,
  error, // Nueva prop
}) {
  return (
    <div className="flex flex-col gap-8 max-w-[455px] w-full items-center">
      <CustomText variant="TitleL" as="h3" className="text-[#0E3C42] font-bold">
        Ingresa tu {label.toLowerCase()}
      </CustomText>

      <div className="flex flex-col gap-6 w-full">
        <CustomInput
          variant="labelM"
          label={label}
          type="text"
          inputMode="numeric"
          placeholder={`Escribe aquí tu ${label.toLowerCase()}`}
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          className="w-full gap-2"
          classLabel="font-bold text-[#333333]"
          classInput={`bg-[#FFFFFF] rounded-lg border px-6 py-5 text-[18px] transition-colors ${error ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,1)]" : "border-[#D3DAE0]"
            }`}
        />

        <div className="flex flex-col gap-2 w-full">
          <div className="bg-[#FFEDDD] border-[#F98A56] border-[1px] rounded-lg py-2 px-4 w-full">
            <CustomText
              variant="bodyM"
              className="text-[#1F1F23] font-bold flex items-center gap-2"
            >
              <CustomIcon
                path={ICON_PATHS.warning}
                size={20}
                className="text-[#F98A56]"
              />
              Solo números, sin puntos ni espacios
            </CustomText>
          </div>

          {/* MENSAJE DE ERROR EN ROJO */}
          {error && (
            <CustomText
              variant="bodyS"
              className="text-red-500 font-bold pl-2 animate-in fade-in slide-in-from-top-1"
            >
              No se encontró el documento ingresado. Por favor, verifique.
            </CustomText>
          )}
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
        <CustomText variant="bodyM" className="text-[#3D3D44] font-regular">
          ¿Problemas con tu documento?
        </CustomText>
        <button className="bg-transparent border-none">
          <CustomText variant="bodyM" className="text-[#4059FF] font-medium underline underline-offset-2">
            Contactar Soporte
          </CustomText>
        </button>
      </div>
    </div>
  );
}