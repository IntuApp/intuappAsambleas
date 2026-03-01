"use client";

import React, { useState } from "react";
import CustomText from "@/components/basics/CustomText";
import CustomOptionSelect from "@/components/basics/CustomOptionSelect";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function Step3Properties({
  verificationQueue,
  onContinue,
  assembly,
}) {
  const [role, setRole] = useState("owner");
  const [file, setFile] = useState(null);

  const currentReg = verificationQueue[0]; // Sabemos que es solo una por la lógica de la page

  if (!currentReg) return null;

  return (
    <div className="flex flex-col items-center w-full gap-8 animate-in fade-in zoom-in-95 max-w-[455px]">
      <div className="flex flex-col gap-2">
        <CustomText variant="TitleL" as="h3" className="text-[#0E3C42] font-bold">
          Propiedades identificadas
        </CustomText>
        <CustomText variant="bodyL" className="text-[#3D3D44]">
          Vas a representar las siguientes porpiedades:
        </CustomText>
      </div>

      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-left">
          <CustomText variant="bodyX" as="h5" className="text-[#0E3C42] font-bold">
            Seleccione su participación
          </CustomText>
          <CustomOptionSelect
            value={role}
            onChange={(v) => setRole(v)}
            classContentOptions="flex flex-col md:flex-col gap-3"
            options={[
              { label: "Soy el propietario", value: "owner" },
              { label: "Soy apoderado", value: "proxy" },
            ]}
          />
        </div>

        {/* Carga de Archivo: SOLO si es Apoderado y NO es Presencial (typeId !== "1") */}
        {role === "proxy" && assembly.typeId !== "1" && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-top-4">
            <div className="flex flex-col gap-1 text-left">
              <CustomText variant="bodyX" as="h5" className="text-[#0E3C42] font-bold">
                Carta poder (Opcional)
              </CustomText>
              <CustomText variant="labelL" className="text-[#838383]">
                Puedes adjuntar el poder ahora o presentarlo luego.
              </CustomText>
            </div>

            <div className="relative border-2 border-dashed border-[#8B9DFF]/30 rounded-[24px] p-8 flex flex-col items-center bg-slate-50/50">
              <CustomIcon
                path={file ? ICON_PATHS.check : ICON_PATHS.uploadFile}
                size={40}
                className={file ? "text-green-500" : "text-[#6A7EFF]"}
              />
              <CustomText variant="labelM" className="text-[#0E3C42] font-bold mt-4">
                {file ? "¡Archivo cargado!" : "Subir carta poder"}
              </CustomText>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => e.target.files[0] && setFile(e.target.files[0])}
              />
            </div>
          </div>
        )}
      </div>

      <CustomButton
        variant="primary"
        onClick={() => onContinue(role, file)}
        className="py-5 px-4 font-bold w-full rounded-xl shadow-lg shadow-blue-100"
      >
        Continuar
      </CustomButton>
    </div>
  );
}