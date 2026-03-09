"use client";

import React from "react";
import CustomText from "@/components/basics/CustomText";
import CustomInput from "@/components/basics/CustomInput";
import CustomButton from "@/components/basics/CustomButton";

export default function Step2UserInfo({
  userInfo,
  setUserInfo,
  onNext,
  assembly,
  loading,
}) {
  // Validación dinámica de campos obligatorios
  const isFormInvalid = () => {
    if (assembly.requireFullName && (!userInfo.firstName?.trim() || !userInfo.lastName?.trim())) return true;
    if (assembly.requireEmail && !userInfo.email?.trim()) return true;
    if (assembly.requirePhone && !userInfo.phone?.trim()) return true;
    return false;
  };

  const handleInputChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col gap-8 w-full md:items-center max-w-[455px]">
      <div className="md:text-center flex flex-col gap-2 ">
        <CustomText variant="TitleL" as="h3" className="text-[#0E3C42] font-black">
          Completa tus datos
        </CustomText>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {/* Nombres y Apellidos */}
        {assembly.requireFullName && (
          <div className="flex flex-col gap-4 ">
            <CustomInput
              label="Nombres"
              placeholder="Ej: Juan Antonio"
              value={userInfo.firstName || ""}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="flex-1"
              classLabel="font-bold text-[#333333]"
              classInput={`bg-[#FFFFFF] rounded-lg border px-6 py-4 text-[18px] transition-colors`}
            />
            <CustomInput
              label="Apellidos"
              placeholder="Ej: Pérez García"
              value={userInfo.lastName || ""}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="flex-1"
              classLabel="font-bold text-[#333333]"
              classInput={`bg-[#FFFFFF] rounded-lg border px-6 py-4 text-[18px] transition-colors`}
            />
          </div>
        )}

        {/* Correo Electrónico */}
        {assembly.requireEmail && (
          <CustomInput
            label="Correo electrónico"
            type="email"
            placeholder="correo@ejemplo.com"
            value={userInfo.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            classLabel="font-bold text-[#333333]"
            classInput={`bg-[#FFFFFF] rounded-lg border px-6 py-4 text-[18px] transition-colors`}
          />
        )}

        {/* Teléfono */}
        {assembly.requirePhone && (
          <CustomInput
            label="Teléfono / WhatsApp"
            type="tel"
            placeholder="300 123 4567"
            value={userInfo.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            classLabel="font-bold text-[#333333]"
            classInput={`bg-[#FFFFFF] rounded-lg border px-6 py-4 text-[18px] transition-colors`}
          />
        )}
      </div>

      <CustomButton
        variant="primary"
        onClick={onNext}
        disabled={loading || isFormInvalid()}
        className="py-4 px-4 font-bold w-full  mt-4"
      >
        {loading ? "Cargando..." : "Continuar"}
      </CustomButton>
    </div>
  );
}