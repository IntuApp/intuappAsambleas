import React, { useState } from "react";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import { Check } from "lucide-react"; // 🔥 Usamos Check de lucide-react

export default function Step7Terms({ onAccept, loading }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="flex flex-col items-center text-center max-w-[455px] w-full gap-4">
      <CustomText variant="TitleL" className="text-[#0E3C42] font-bold">
        Términos y condiciones
      </CustomText>

      <div className="p-6 rounded-2xl border border-[#F3F6F9] shadow-soft text-start gap-4 flex flex-col">
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
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <div className="relative pt-0.5">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="peer sr-only"
            />

            <div
              className="h-5 w-5 shrink-0 rounded-[4px] border-2 border-gray-300 
                      peer-checked:bg-[#6A7EFF] 
                      peer-checked:border-[#6A7EFF] 
                      transition-all flex items-center justify-center"
            >
              {accepted && (
                // 🔥 Tamaño fijo, centrado y con grosor ajustado
                <Check size={14} className="text-white" strokeWidth={3.5} />
              )}
            </div>
          </div>

          <CustomText variant="labelL" className="text-[#333333] text-left">
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