import React from "react";
import Button from "@/components/basics/Button";
import { AlertTriangle, X } from "lucide-react";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import { getTypeName } from "@/lib/utils";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  entityForm,
  title,
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isDestructive = true,
  isLoading = false,
}) {
  if (!isOpen) return null;

  const typeName = getTypeName(entityForm);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl max-w-[540px] max-h-[300px] p-8">
        <div className=" flex flex-col text-start gap-6">
          <CustomText variant="TitleL" className="font-bold text-[#0E3C42]">
            {title}
          </CustomText>

          <div>
            {entityForm && (
              <CustomText variant="bodyM">
                ¿Deseas crear la entidad{" "}
                <strong className="font-bold">
                  {typeName} {entityForm.name}
                </strong>
                ?
              </CustomText>
            )}
            <CustomText variant="bodyM" className="text-[#333333] font-normal">
              {message}
            </CustomText>
          </div>

          <div className="flex gap-3 w-full mt-4">
            <CustomButton
              variant="secondary"
              onClick={onClose}
              className={`flex-1 px-4 py-2.5 shadow-md transition-all `}
            >
              <CustomText variant="labelL" className="text-[#0E3C42] font-bold">
                {cancelText}
              </CustomText>
            </CustomButton>
            <CustomButton
              variant="primary"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 shadow-md transition-all `}
            >
              <CustomText variant="labelL" className="text-[#000000] font-bold">
                {confirmText}
              </CustomText>
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}
