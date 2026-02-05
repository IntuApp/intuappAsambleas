import React from "react";
import { Check } from "lucide-react";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/app/constans/iconPaths";

export default function SuccessModal({
  isOpen,
  title = "¡Entidad creada con éxito!",
  message,
  buttonText = "Gestionar Entidad",
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl max-w-[600px] max-h-[390px] w-full p-8 flex flex-col items-center text-center gap-6 shadow-xl animate-in fade-in zoom-in-95">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-[#EEF0FF] flex items-center justify-center">
          <CustomIcon path={ICON_PATHS.task} size={60} color="#6A7EFF" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2 max-w-[530px] px-16">
          <CustomText variant="TitleL" className="font-bold text-[#0E3C42]">
            {title}
          </CustomText>
          <CustomText variant="bodyM" className="text-[#333333] font-normal">
            {message}
          </CustomText>
        </div>

        {/* Action */}
        <CustomButton
          variant="primary"
          onClick={onConfirm}
          className="w-full py-3 rounded-full flex items-center justify-center gap-2"
        >
          <CustomText variant="labelL" className="font-bold">
            {buttonText}
          </CustomText>
          <CustomIcon path={ICON_PATHS.arrowLeft} size={20} color="#000000" />
        </CustomButton>
      </div>
    </div>
  );
}
