import React from "react";
import { Building2, UploadCloud, ArrowRight, Check } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import CustomMultiSelect from "@/components/basics/inputs/CustomMultiSelect";
import CustomOptionSelect from "@/components/basics/inputs/CustomOptionSelect";
import CustomButton from "@/components/basics/CustomButton";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomIcon from "@/components/basics/CustomIcon";

export default function Step3Properties({
  verificationQueue,
  currentVerificationIndex,
  currentRole,
  setCurrentRole,
  currentFile,
  setCurrentFile,
  onContinue,
  assembly,
}) {
  const currentReg = verificationQueue[currentVerificationIndex];

  if (!currentReg) return null;

  return (
    <div className="flex flex-col items-center text-center max-w-[455px] w-full gap-6">
      <div>
        <CustomText
          variant="TitleL"
          as="h3"
          className="text-[#0E3C42] font-bold"
        >
          Propiedades identificadas
        </CustomText>
        <CustomText variant="labelL" className="text-medium">
          Vas a representar las siguientes propiedades:
        </CustomText>
      </div>

      <div className="w-full flex flex-col gap-4 text-left">
        <CustomText
          variant="bodyX"
          as="h5"
          className="text-[#0E3C42] font-bold"
        >
          Seleccione su participación
        </CustomText>

        <CustomOptionSelect
          value={currentRole}
          onChange={(v) => setCurrentRole(v)}
          classContentOptions="md:flex-col"
          options={[
            { label: "Como propietario", value: "owner" },
            { label: "Como apoderado", value: "proxy" },
          ]}
        />
        <div className="flex flex-col gap-4">
          {/* Proxy Upload */}
          {currentRole === "proxy" && assembly.type !== "Presencial" && (
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
                  className="text-[#0E3C42] font-regular"
                >
                  Sube la carta poder que te autoriza
                </CustomText>
              </div>
              <div className="border-2 border-dashed border-[#8B9DFF]/30 rounded-[24px] p-8 gap-5 flex flex-col items-center justify-center text-center bg-indigo-50/10 relative hover:bg-indigo-50/20 transition-all group overflow-hidden">
                <CustomIcon path={ICON_PATHS.uploadFile} size={32} className="text-[#6A7EFF]"/>
                <div className="flex flex-col gap-2">
                  <CustomText
                  variant="labelM"
                  className="text-[#0E3C42] font-bold"
                >
                  {currentFile ? "¡Archivo cargado!" : "Arrastra y suelta aquí o"}
                </CustomText>
                {!currentFile && (
                  <CustomText
                    variant="labelM"
                    className="text-[#0E3C42] font-bold bg-[#94A2FF] px-4 py-3 rounded-full"
                  >
                    Selecciona el archivo
                  </CustomText>
                )}
                <CustomText
                  variant="captionL"
                  className="font-medium"
                >
                  {currentFile
                    ? currentFile.name
                    : "El archivo debe ser formato PDF, JPG o PNG"}
                </CustomText>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) =>
                    e.target.files[0] && setCurrentFile(e.target.files[0])
                  }
                />
                </div>
                {currentFile && (
                  <div className="absolute top-4 right-4 text-green-500">
                    <Check size={20} strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <CustomButton
          variant="primary"
          onClick={onContinue}
          disabled={!currentRole}
          className="py-4 px-4 font-bold flex items-center gap-2 w-full justify-center"
        >
          Continuar
        </CustomButton>
      </div>
    </div>
  );
}
