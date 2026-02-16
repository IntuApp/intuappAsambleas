"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getEntityById,
  getAssemblyRegistriesList,
  toggleVoteBlock,
} from "@/lib/entities";
import {
  createAssembly,
  getAssemblyById,
  updateAssembly,
} from "@/lib/assembly";
import { toast } from "react-toastify";

import Loader from "@/components/basics/Loader";
import CustomText from "@/components/basics/CustomText";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import SuccessModal from "@/components/modals/SuccessModal";
import VoteRestrictionSection from "@/components/assemblies/VoteRestrictionSection";
import CustomSelect from "../basics/inputs/CustomSelect";
import CustomOptionSelect from "../basics/inputs/CustomOptionSelect";
import CustomMultiSelect from "../basics/inputs/CustomMultiSelect";
import CustomInput from "../basics/inputs/CustomInput";
import CustomTimeInput from "../basics/inputs/CustomTimeInput";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function EditAssemblySection({
  entityName,
  mode,
  formData,
  onInputChange,
  registries,
  blockedVoters,
  onToggleVote,
  submitting,
  onCancel,
  onSubmit,
  showConfirmModal,
  onConfirmSubmit,
  onCloseConfirmModal,
  showSuccessModal,
  onSuccessConfirm,
}) {
  return (
    <div className="flex flex-col w-full max-w-[1128px] gap-5">
      <div className="">
        <CustomText
          variant="TitleL"
          as="h3"
          className="text-[#0E3C42] font-bold"
        >
          {mode === "edit" ? "Gestionar" : "Crear"} Asamblea
        </CustomText>
        <CustomText variant="bodyX" className="text-[#0E3C42] font-medium">
          En {entityName}
        </CustomText>
      </div>
      <div className="max-w-[1128px] max-h-[517px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5 shadow-soft">
        <CustomText
          variant="bodyX"
          as="h5"
          className="text-[#0E3C42] font-bold"
        >
          1. Datos Asamblea
        </CustomText>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CustomInput
            label="Nombre de la asamblea"
            variant="labelM"
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            placeholder="Escriba aquí un nombre descriptivo"
          />

          <CustomSelect
            label="Fecha de la asamblea"
            variant="labelM"
            type="date"
            className="max-w-[344px] max-h-[80px] "
            classLabel="text-[#333333] font-bold"
            value={formData.date}
            onChange={(e) => onInputChange("date", e.target.value)}
            placeholder="Seleccione la fecha"
          />

          <CustomTimeInput
            label="Hora de inicio"
            required
            value={{
              hour: formData.hour,
              minute: formData.minute,
              ampm: formData.ampm,
            }}
            onChange={(val) => {
              onInputChange("hour", val.hour);
              onInputChange("minute", val.minute);
              onInputChange("ampm", val.ampm);
            }}
          />
        </div>
        <div className="">
          <CustomOptionSelect
            label="Tipo de asamblea"
            required
            value={formData.type}
            onChange={(v) => onInputChange("type", v)}
            options={[
              { label: "Presencial", value: "Presencial" },
              { label: "Virtual", value: "Virtual" },
              { label: "Mixta", value: "Mixta" },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CustomInput
            label="Link de videollamada"
            variant="labelM"
            disabled={formData.type === "Presencial"}
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={formData.meetLink}
            onChange={(e) => onInputChange("meetLink", e.target.value)}
            placeholder="Pega el link de la llamada aquí"
          />
          <CustomOptionSelect
            label="¿Vas a tener Soporte por WhatsApp?"
            required
            value={formData.hasWppSupport}
            onChange={(v) => onInputChange("hasWppSupport", v)}
            options={[
              { label: "Sí", value: true },
              { label: "No", value: false },
            ]}
          />
          <CustomInput
            label="Número de WhatsApp para Soporte"
            variant="labelM"
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={formData.wppPhone}
            onChange={(e) => onInputChange("wppPhone", e.target.value)}
            disabled={!formData.hasWppSupport}
            placeholder="Escriba aquí el número para soporte"
          />
        </div>
      </div>

      {/* 2. Configuración de registro */}
      <div className="max-w-[1128px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5 shadow-soft">
        <CustomText
          variant="bodyX"
          as="h5"
          className="text-[#0E3C42] font-bold"
        >
          2. Configuración de registro para asambleístas
        </CustomText>
        <CustomText variant="bodyL" className="text-[#333333] font-regular">
          Defina cómo ingresarán los Asambleístas
        </CustomText>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomOptionSelect
            label="Método de Ingreso"
            required
            value={formData.accessMethod}
            onChange={(v) => onInputChange("accessMethod", v)}
            options={[
              {
                label: "Documento de la base de datos",
                value: "database_document",
              },
            ]}
          />
        </div>

        <div>
          <CustomMultiSelect
            label="Solicitar información adicional"
            optional
            value={[
              formData.requireFullName && "name",
              formData.requireEmail && "email",
              formData.requirePhone && "phone",
            ].filter(Boolean)}
            onChange={(values) => {
              onInputChange("requireFullName", values.includes("name"));
              onInputChange("requireEmail", values.includes("email"));
              onInputChange("requirePhone", values.includes("phone"));
            }}
            options={[
              { label: "Nombre y apellido", value: "name" },
              { label: "Correo electrónico", value: "email" },
              { label: "Número de teléfono", value: "phone" },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomOptionSelect
            label="¿El asambleísta puede añadir otras representaciones?"
            required
            value={formData.canAddOtherRepresentatives}
            onChange={(v) => onInputChange("canAddOtherRepresentatives", v)}
            options={[
              { label: "Sí", value: true },
              { label: "No", value: false },
            ]}
          />
        </div>
      </div>

      {/* 3. Poderes */}
      <div className="max-w-[1128px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-6 shadow-soft">
        <CustomText
          variant="bodyX"
          as="h5"
          className="text-[#0E3C42] font-bold"
        >
          3. Poderes{" "}
        </CustomText>
        <CustomText variant="bodyL" className="text-[#333333] font-regular">
          Defina el número máximo de poderes que un propietario puede tener.
        </CustomText>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomSelect
            label="Límite de Poderes por Propietario"
            variant="labelM"
            classLabel="text-[#333333] font-bold"
            value={formData.powerLimit}
            onChange={(e) => onInputChange("powerLimit", e.target.value)}
          >
            <option value="">Sin límite</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </CustomSelect>
        </div>
      </div>

      {/* 4. Restricción de voto */}
      {mode === "create" && (
        <div className="max-w-[1128px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-6 shadow-soft">
          <VoteRestrictionSection
            registries={registries}
            blockedVoters={blockedVoters}
            onToggleVote={onToggleVote}
          />
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex justify-end gap-4">
        <CustomButton
          variant="secondary"
          onClick={onCancel}
          className="px-5 py-3"
        >
          <CustomText variant="bodyM" className="font-bold">
            Cancelar
          </CustomText>
        </CustomButton>
        <CustomButton
          variant="primary"
          onClick={onSubmit}
          disabled={submitting}
          className="px-5 py-3 flex items-center gap-2"
        >
          <CustomIcon path={ICON_PATHS.check} />
          <CustomText variant="bodyM" className="font-bold">
            {mode === "edit" ? "Actualizar" : "Crear"} Asamblea
          </CustomText>
        </CustomButton>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={onCloseConfirmModal}
        onConfirm={onConfirmSubmit}
        title="Restricción de voto"
        message={`Ha restringido el voto de ${blockedVoters.size} asambleístas. ¿Confirma que esta información es correcta y que cumple el reglamento interno?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        isLoading={submitting}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        title="¡Asamblea creada con éxito!"
        message="La asamblea ha sido creada y configurada correctamente con las restricciones definidas."
        buttonText="Ir a la asamblea"
        onConfirm={onSuccessConfirm}
      />
    </div>
  );
}
