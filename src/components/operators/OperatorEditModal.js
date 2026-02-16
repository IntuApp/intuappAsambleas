"use client";

import CustomButton from "@/components/basics/CustomButton";
import CustomText from "@/components/basics/CustomText";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import OperatorDataBasicStep from "@/components/operators/OperatorBasicDataStep";

export default function OperatorEditModal({
  isOpen,
  formData,
  setFormData,
  onClose,
  onSubmit,
  loading,
  setConfirmEmail,
  setConfirmPassword,
}) {

  if (!isOpen) return null;

  return (
    <div className="flex w-full max-w-[1128px] flex-col gap-6 mx-auto">
      <div className="">
        <OperatorDataBasicStep
          mode="edit"
          formDataOperator={formData}
          setFormDataOperator={setFormData}
          setConfirmEmail={setConfirmEmail}
          setConfirmPassword={setConfirmPassword}
        />
      </div>

      <div className="flex justify-end gap-4">
        <CustomButton
          variant="secondary"
          size="L"
          className="px-4 py-2 border-[2px]"
          onClick={onClose}
        >
          <CustomText variant="labelL" className="font-bold text-[#0E3C42]">
            Cancelar
          </CustomText>
        </CustomButton>

        <CustomButton
          variant="primary"
          className="py-3 px-4 flex gap-2"
          onClick={onSubmit}
          disabled={loading}
        >
          <CustomIcon path={ICON_PATHS.check} size={24} />
          <CustomText variant="labelL" className="font-bold">
            Guardar
          </CustomText>
        </CustomButton>
      </div>
    </div>
  );
}
