"use client";
import React from "react";
import {
  Building2,
  FileText,
  ArrowRight,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import CustomOptionSelect from "@/components/basics/inputs/CustomOptionSelect";
import CustomButton from "@/components/basics/CustomButton";
import CustomSelect from "@/components/basics/inputs/CustomSelect";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function Step4AddProperties({
  addAnotherDecision,
  setAddAnotherDecision,
  onDecisionContinue,
  addPropType,
  setAddPropType,
  addPropGroup,
  setAddPropGroup,
  addPropRegistry,
  setAddPropRegistry,
  addPropRole,
  setAddPropRole,
  addPropFile,
  setAddPropFile,
  onConfirmManualAdd,
  availableTypes,
  availableGroups,
  filteredProperties,
  entity,
  assembly,
  hasStepDecision,
}) {
  /* ------------------------------------------------ */
  /* 🔥 HELPER PARA RESOLVER ALIAS DINÁMICAMENTE     */
  /* ------------------------------------------------ */
  const getColumnLabel = (possibleKeys, fallback) => {
    if (!entity?.columnAliases) return fallback;

    const match = Object.keys(entity.columnAliases).find((key) =>
      possibleKeys.includes(key.toLowerCase())
    );

    return match ? entity.columnAliases[match] : fallback;
  };

  /* ------------------------------------------------ */
  /* DECISIÓN INICIAL                                */
  /* ------------------------------------------------ */
  if (!hasStepDecision && setAddAnotherDecision) {
    return (
      <div className="flex flex-col items-center text-center max-w-[520px] px-4 gap-6">
        <div className="flex flex-col gap-2 w-full">
          <CustomText
            variant="TitleL"
            as="h1"
            className="text-[#0E3C42] font-bold"
          >
            ¿Quieres añadir otra propiedad?
          </CustomText>
          <CustomText variant="labelL" className="text-medium">
            Marca si vas a representar a otra propiedad
          </CustomText>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <CustomOptionSelect
            value={addAnotherDecision}
            onChange={(v) => setAddAnotherDecision(v)}
            classContentOptions="md:flex-col gap-3"
            options={[
              { label: "Sí, tengo otra propiedad", value: "yes" },
              { label: "No, no voy a representar otra", value: "no" },
            ]}
          />
        </div>

        <CustomButton
          variant="primary"
          onClick={onDecisionContinue}
          disabled={!addAnotherDecision}
          className="py-4 px-4 font-bold flex items-center gap-2 w-full justify-center"
        >
          Continuar
        </CustomButton>
      </div>
    );
  }

  /* ------------------------------------------------ */
  /* FORMULARIO MANUAL                               */
  /* ------------------------------------------------ */
  return (
    <div className="flex flex-col items-center max-h-[450px] max-w-[520px] w-full h-full p-4 gap-6 overflow-y-auto scrollbar-hide">
      <CustomText variant="TitleL" as="h1" className="text-[#0E3C42] font-bold">
        Añade la propiedad adicional
      </CustomText>

      <div className="flex flex-col justify-center gap-6 w-full max-w-[455px] px-4">

        {/* -------- TIPO -------- */}
        {availableTypes.length > 1 && (
          <CustomSelect
            label={getColumnLabel(
              ["tipo", "tipo_propiedad"],
              "Tipo de propiedad"
            )}
            variant="labelM"
            optional={false}
            className="max-w-[455px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classSelect="text-[#838383] font-normal border-[#D3DAE0]"
            value={addPropType}
            onChange={(e) => setAddPropType(e.target.value)}
          >
            <option value="">Selecciona el tipo</option>
            {availableTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </CustomSelect>
        )}

        {(addPropType || availableTypes.length === 1) && (
          <>
            {/* -------- GRUPO -------- */}
            {availableGroups.length > 0 && (
              <CustomSelect
                label={getColumnLabel(
                  ["grupo", "torre", "bloque"],
                  "Grupo"
                )}
                variant="labelM"
                optional={false}
                className="max-w-[455px] max-h-[80px]"
                classLabel="text-[#333333] font-bold"
                classSelect="text-[#838383] font-normal border-[#D3DAE0]"
                value={addPropGroup}
                onChange={(e) => setAddPropGroup(e.target.value)}
              >
                <option value="">Selecciona el grupo</option>
                {availableGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </CustomSelect>
            )}

            {/* -------- PROPIEDAD -------- */}
            {(addPropGroup || availableGroups.length === 0) && (
              <CustomSelect
                label={getColumnLabel(
                  ["propiedad", "numero", "apartamento"],
                  "Propiedad"
                )}
                variant="labelM"
                optional={false}
                className="max-w-[455px] max-h-[80px]"
                classLabel="text-[#333333] font-bold"
                classSelect="text-[#838383] font-normal border-[#D3DAE0]"
                value={addPropRegistry?.id || ""}
                onChange={(e) =>
                  setAddPropRegistry(
                    filteredProperties.find((r) => r.id === e.target.value)
                  )
                }
              >
                <option value="">Selecciona la propiedad</option>
                {filteredProperties.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.propiedad}
                  </option>
                ))}
              </CustomSelect>
            )}
          </>
        )}

        {/* -------- PARTICIPACIÓN -------- */}
        {(addPropGroup || availableGroups.length === 0) &&
          addPropRegistry && (
            <div className="w-full flex flex-col gap-4 text-left">
              <CustomText
                variant="bodyX"
                as="h5"
                className="text-[#0E3C42] font-bold"
              >
                Seleccione su participación
              </CustomText>

              <CustomOptionSelect
                value={addPropRole}
                onChange={(v) => setAddPropRole(v)}
                classContentOptions="md:flex-col"
                options={[
                  { label: "Como propietario", value: "owner" },
                  { label: "Como apoderado", value: "proxy" },
                ]}
              />

              {/* -------- CARTA PODER -------- */}
              {addPropRole === "proxy" &&
                assembly?.type !== "Presencial" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <CustomText
                        variant="bodyX"
                        as="h5"
                        className="text-[#0E3C42] font-bold"
                      >
                        Carta poder
                      </CustomText>
                      <CustomText
                        variant="labelL"
                        className="text-[#0E3C42]"
                      >
                        Sube la carta poder que te autoriza
                      </CustomText>
                    </div>

                    <div className="border-2 border-dashed border-[#8B9DFF]/30 rounded-[24px] p-8 flex flex-col items-center justify-center text-center relative hover:bg-indigo-50/20 transition-all group overflow-hidden">
                      <CustomIcon
                        path={ICON_PATHS.uploadFile}
                        size={32}
                        className="text-[#6A7EFF]"
                      />

                      <div className="flex flex-col items-center gap-2">
                        <CustomText
                          variant="labelM"
                          className="text-[#0E3C42] font-bold"
                        >
                          {addPropFile
                            ? "¡Archivo cargado!"
                            : "Arrastra y suelta aquí o"}
                        </CustomText>

                        {!addPropFile && (
                          <CustomText
                            variant="labelM"
                            className="max-w-[170px] text-[#0E3C42] font-bold bg-[#94A2FF] px-2 py-3 rounded-full"
                          >
                            Selecciona el archivo
                          </CustomText>
                        )}

                        <CustomText
                          variant="captionL"
                          className="font-medium"
                        >
                          {addPropFile
                            ? addPropFile.name
                            : "El archivo debe ser formato PDF, JPG o PNG"}
                        </CustomText>

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) =>
                            e.target.files[0] &&
                            setAddPropFile(e.target.files[0])
                          }
                        />
                      </div>

                      {addPropFile && (
                        <div className="absolute top-4 right-4 text-green-500">
                          <Check size={20} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

              <CustomButton
                variant="primary"
                onClick={onConfirmManualAdd}
                disabled={!addPropRegistry || !addPropRole}
                className="py-4 px-4 font-bold flex items-center gap-2 w-full justify-center"
              >
                Añadir Propiedad
              </CustomButton>
            </div>
          )}
      </div>
    </div>
  );
}
