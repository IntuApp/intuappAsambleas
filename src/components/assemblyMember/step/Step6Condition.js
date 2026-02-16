import React, { useState } from "react";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function Step6Condition({ onAccept, loading }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="flex flex-col items-center text-center max-w-[455px] w-full gap-6">
      <CustomText variant="TitleL" className="text-[#0E3C42] font-bold">
        Términos y condiciones
      </CustomText>

      <div className="p-6 rounded-2xl border shadow-sm text-start gap-4 flex flex-col">
        <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
          Términos de uso de IntuApp
        </CustomText>

        <CustomText variant="labelL" className="text-[#333333]">
          Con el envío de sus datos está declarando que toda la información
          suministrada es veraz y no está suplantando a nadie para la
          participación en la asamblea.
        </CustomText>

        <CustomText variant="labelL" className="text-[#333333]">
          Entiendes que el uso indebido de la identidad de un propietario o el
          suministro de información falsa podrá ser reportado a las autoridades
          competentes y acarreará las sanciones legales pertinentes según el
          reglamento de propiedad horizontal.
        </CustomText>
      </div>

      {/* Checkbox */}
      <div className="w-full flex items-center gap-3 px-2">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="peer sr-only"
            />

            <div
              className="h-5 w-5 rounded-sm border border-gray-300 
                      peer-checked:bg-[#6A7EFF] 
                      peer-checked:border-[#6A7EFF] 
                      transition-all flex items-center justify-center"
            >
              {accepted && (
                <CustomIcon path={ICON_PATHS.check} className="text-white" />
              )}
            </div>
          </div>

          <CustomText variant="labelL" className="text-[#333333]">
            He leído y acepto los términos y condiciones
          </CustomText>
        </label>
      </div>

      {/* Botón */}
      <CustomButton
        variant="primary"
        onClick={onAccept}
        disabled={!accepted || loading}
        className="w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Procesando Registro..." : "Continuar"}
      </CustomButton>
    </div>
  );
}
