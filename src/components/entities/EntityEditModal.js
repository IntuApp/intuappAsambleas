"use client";

import React from "react";
import CustomInput from "@/components/basics/CustomInput"; // Ajusta tus rutas
import CustomSelect from "@/components/basics/CustomSelect";
import CustomButton from "@/components/basics/CustomButton";
import CustomText from "@/components/basics/CustomText";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import { colombiaCities } from "@/constans/colombiaCities";

export default function EntityEditModal({
  isOpen,
  onClose,
  entityForm,
  setEntityForm,
  entityTypes,
  onSubmit,
  loading
}) {
  if (!isOpen) return null;

  // Manejador genérico para los inputs
  const handleChange = (field, value) => {
    setEntityForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    // Overlay oscuro
    <div className="">

      {/* Contenedor del Modal */}
      <div className="bg-white rounded-3xl w-full overflow-y-auto shadow-xl flex flex-col relative animate-in fade-in zoom-in duration-200">

        {/* Cuerpo del Modal (Formulario) */}
        <div className="p-8 flex flex-col gap-4">

          {/* SECCIÓN 1: Datos de la Entidad */}
          <div className="flex flex-col gap-4">
            <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">
              Datos de la Entidad
            </CustomText>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <CustomInput
                label="Nombre de la entidad"
                value={entityForm.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Escribe aquí el nombre"
                classLabel="font-bold text-[#333333]"
                classInput="w-full rounded-lg border focus:border-[#94A2FF] outline-none transition-colors px-4 py-3"
              />
              <CustomInput
                label="NIT"
                value={entityForm.nit}
                onChange={(e) => handleChange("nit", e.target.value)}
                placeholder="Escribe aquí el Nit"
                optional
                classLabel="font-bold text-[#333333]"
                classInput="w-full rounded-lg border focus:border-[#94A2FF] outline-none transition-colors px-4 py-3"
              />
              <CustomSelect
                label="Tipo de entidad"
                value={entityForm.type}
                onChange={(e) => handleChange("type", e.target.value)}
                classLabel="font-bold text-[#333333]"
                classSelect="w-full rounded-lg border focus:border-[#94A2FF] outline-none transition-colors px-4 py-3 text-gray-600"
              >
                <option value="">Selecciona aquí el tipo de unidad</option>
                {entityTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </CustomSelect>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <CustomSelect
                label="Ciudad"
                value={entityForm.city}
                onChange={(e) => handleChange("city", e.target.value)}
                optional
                classLabel="font-bold text-[#333333]"
                classSelect="w-full rounded-lg border focus:border-[#94A2FF] outline-none transition-colors px-4 py-3 text-gray-600"
              >
                <option value="">Selecciona aquí la ciudad</option>
                {colombiaCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </CustomSelect>

              <CustomInput
                label="Dirección"
                value={entityForm.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Escribe aquí la dirección"
                optional
                classLabel="font-bold text-[#333333]"
                classInput="w-full rounded-lg border focus:border-[#94A2FF] outline-none transition-colors px-4 py-3"
              />
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* SECCIÓN 2: Administrador */}
          <div className="flex flex-col gap-4">
            <CustomText variant="bodyL" className="text-[#333333] font-regular">
              Ingrese los detalles básicos del administrador o funcionario de la
              entidad:
            </CustomText>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomInput
                label="Nombre"
                value={entityForm.adminName}
                onChange={(e) => handleChange("adminName", e.target.value)}
                placeholder="Escribe aquí el nombredel admin"
                optional
                classLabel="font-bold text-[#333333]"
                classInput="w-full rounded-lg border focus:border-[#94A2FF] outline-none transition-colors px-4 py-3"
              />
              <CustomInput
                label="Correo"
                value={entityForm.adminEmail}
                onChange={(e) => handleChange("adminEmail", e.target.value)}
                placeholder="Escribe aquí el correo"
                optional
                classLabel="font-bold text-[#333333]"
                classInput="w-full rounded-lg border focus:border-[#94A2FF] outline-none transition-colors px-4 py-3"
              />
              <CustomInput
                label="Celular"
                value={entityForm.adminPhone}
                onChange={(e) => handleChange("adminPhone", e.target.value)}
                placeholder="Escribe aquí el número"
                optional
                classLabel="font-bold text-[#333333]"
                classInput="w-full rounded-lg border focus:border-[#94A2FF] outline-none transition-colors px-4 py-3"
              />
            </div>
          </div>

        </div>

        {/* Footer del Modal (Botones) */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 rounded-b-3xl">
          <CustomButton
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 border-[2px] rounded-full"
          >
            <CustomText variant="labelL" className="font-bold text-[#0E3C42]">
              Cancelar
            </CustomText>
          </CustomButton>

          <CustomButton
            variant="primary"
            onClick={onSubmit}
            disabled={loading}
            className="py-3 px-6 flex items-center justify-center gap-2 rounded-full"
          >
            <CustomIcon path={ICON_PATHS.check || "M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"} size={24} color="#00093F" />
            <CustomText variant="labelL" className="font-bold">
              {loading ? "Guardando..." : "Guardar Cambios"}
            </CustomText>
          </CustomButton>
        </div>

      </div>
    </div>
  );
}