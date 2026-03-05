"use client";
import React from "react";
import CustomButton from "../basics/CustomButton";
import CustomText from "../basics/CustomText";
import CustomInput from "../basics/CustomInput"; // Tu componente tal cual está
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function EditColumnModal({
  isOpen,
  columnName,
  value, // Este es el valor que viene de la base de datos (ej: "Coeficiente")
  onChange,
  onCancel,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00093F80]">
      <div className="w-full max-w-[500px] max-h-[604px] bg-white rounded-[24px] p-5 shadow-xl flex flex-col justify-between">
        <div className="flex flex-col gap-5">
          <div>
            <CustomText variant="TitleL" className="font-bold text-[#0E3C42]">
              Editar nombre de la
            </CustomText>
            <CustomText variant="TitleL" className="font-bold text-[#0E3C42]">
              columna: {columnName}
            </CustomText>
          </div>

          <CustomText variant="labelL" className="text-[#333333] font-medium">
            Define cómo se llamará esta columna en tu base de datos.
          </CustomText>

          <div className="mt-6">
            {/* USAMOS TU CustomInput SIN TOCARLO INTERNAMENTE:
               1. No le pasamos "value", así el input nace vacío.
               2. Le pasamos el valor actual al "placeholder".
               3. El "onChange" viaja por el "...rest" hasta el input real.
            */}
            <CustomInput
              variant="labelM"
              label="Escribe el nombre que mejor identifique el tipo de propiedad:"
              classLabel="text-[#333333] font-bold"
              placeholder={value} // El nombre actual aparece en gris
              onChange={(e) => onChange(e.target.value)} // Esto funciona por el ...rest
              classInput="mt-2 w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#94A2FF]"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-5">
          <CustomButton
            variant="secondary"
            onClick={onCancel}
            className="rounded-full px-8 py-4 flex-1"
          >
            <CustomText variant="labelM" className="text-[#0E3C42] font-bold">
              Cancelar
            </CustomText>
          </CustomButton>

          <CustomButton
            variant="primary"
            onClick={onSave}
            className="rounded-full px-8 py-4 flex-1 flex items-center justify-center gap-1 "
          >
            <CustomIcon path={ICON_PATHS.check} className="w-5 h-5" color="#000000" />
            <CustomText variant="labelM" className="text-[#000000] font-bold">
              Guardar cambios
            </CustomText>
          </CustomButton>
        </div>
      </div>
    </div>
  );
}