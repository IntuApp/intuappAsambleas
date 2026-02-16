import React from "react";
import { User, ArrowRight } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import CustomInput from "@/components/basics/inputs/CustomInput";
import CustomButton from "@/components/basics/CustomButton";

export default function Step2UserInfo({
  userInfo,
  setUserInfo,
  onNext,
  assembly,
  loading,
}) {

  const isDisabled = loading || (assembly.requireFullName && (!userInfo.firstName || !userInfo.lastName)) || (assembly.requireEmail && !userInfo.email) || (assembly.requirePhone && !userInfo.phone);
  return (
    <div className="flex flex-col gap-[20] max-w-[455px] w-full items-center">
      <CustomText variant="TitleL" as="h3" className="text-[#0E3C42] font-bold">
        Ingresa tus datos
      </CustomText>

      <div className="w-full flex flex-col gap-3">
        {assembly.requireFullName && (
          <>
            <CustomInput
              variant="labelM"
              label="Nombre"
              placeholder="Escribe aquí tu nombre"
              value={userInfo.firstName}
              onChange={(e) =>
                setUserInfo({
                  ...userInfo,
                  firstName: e.target.value,
                })
              }
              className="w-full gap-2"
              classLabel="font-bold"
              classInput="bg-[#FFFFFF] rounded-lg border border-[#D3DAE0] px-6 py-5 text-[18px]"
            />
            <CustomInput
              variant="labelM"
              label="Apellido"
              placeholder="Escribe aquí tu apellido"
              value={userInfo.lastName}
              onChange={(e) =>
                setUserInfo({ ...userInfo, lastName: e.target.value })
              }
              className="w-full gap-2"
              classLabel="font-bold"
              classInput="bg-[#FFFFFF] rounded-lg border border-[#D3DAE0] px-6 py-5 text-[18px]"
            />
          </>
        )}
        <div className="flex flex-col gap-3">
          {assembly.requireEmail && (
            <CustomInput
              variant="labelM"
              label="Correo electrónico"
              placeholder="Escribe aquí tu correo electrónico"
              value={userInfo.email}
              onChange={(e) =>
                setUserInfo({ ...userInfo, email: e.target.value })
              }
              className="w-full gap-2"
              classLabel="font-bold"
              classInput="bg-[#FFFFFF] rounded-lg border border-[#D3DAE0] px-6 py-5 text-[18px]"
            />
          )}
          {assembly.requirePhone && (
            <CustomInput
              variant="labelM"
              label="Teléfono"
              placeholder="Escribe aquí tu teléfono"
              value={userInfo.phone}
              onChange={(e) =>
                setUserInfo({ ...userInfo, phone: e.target.value })
              }
              className="w-full gap-2"
              classLabel="font-bold"
              classInput="bg-[#FFFFFF] rounded-lg border border-[#D3DAE0] px-6 py-5 text-[18px]"
            />
          )}
        </div>
      </div>
      <CustomButton
        variant="primary"
        onClick={onNext}
        disabled={isDisabled}
        className="py-4 px-4 font-bold flex items-center gap-2 w-full justify-center"
      >
        Continuar
      </CustomButton>
    </div>
  );
}
