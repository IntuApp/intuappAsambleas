"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import CustomTypeAssembly from "../basics/CustomTypeAssembly";
import CustomStates from "./CustomStates";
import Quorum from "./Quorum";
import AssemblyStatsBoxes from "./AssemblyStatsBoxes";
import { ICON_PATHS } from "@/constans/iconPaths";
import { toast } from "react-toastify";
import QrModal from "@/components/modal/QrModal";
import { QRCodeCanvas } from "qrcode.react";
import { formatShortDateWithMonth } from "@/lib/utils";

export default function AssemblyLiveManager({
  assembly,        // Datos de la asamblea (id, name, date, hour, statusID, etc.)
  entity,          // Datos de la entidad padre
  registrations,   // Datos de assemblyRegistrations (registrations[], blockedProperties[])
  masterList,      // Objeto assemblyRegistries de assemblyRegistriesList
  onUpdateStatus,  // Función para cambiar statusID (Server Action)
  onToggleRegister, // Función para cambiar registerIsOpen (Server Action)
  setIsEditing
}) {
  const router = useRouter();
  const { operatorId } = useParams(); // Obtenemos el ID de la URL

  const [showQrModal, setShowQrModal] = React.useState(false);
  const hiddenQrRef = React.useRef(null);

  // --- LÓGICA DE ESTADÍSTICAS ---
  const registeredCount = registrations?.registrations?.length || 0;
  const totalCount = Object.keys(masterList || {}).length || 0;
  const blockedCount = registrations?.blockedProperties?.length || 0;

  // Calculamos el número de PROPIEDADES registradas (no de usuarios)
  const registeredPropertiesCount = React.useMemo(() => {
    if (!registrations?.registrations) return 0;
    let count = 0;
    registrations.registrations.forEach(user => {
      // Si el usuario no ha sido eliminado, sumamos las unidades que representa
      if (!user.isDeleted && user.representedProperties) {
        count += user.representedProperties.length;
      }
    });
    return count;
  }, [registrations]);


  const registeredVotesSum = React.useMemo(() => {
    if (!registrations?.registrations) return 0;

    return registrations.registrations.reduce((accUser, user) => {
      if (user.isDeleted || !user.representedProperties) return accUser;

      const userVotes = user.representedProperties.reduce((accProp, prop) => {
        console.log(prop);
        const vStr = String(prop.votos || masterList[prop.ownerId]?.votos || masterList[prop.ownerId]?.Votos || "0");
        const v = parseFloat(vStr.replace(',', '.'));
        return accProp + (isNaN(v) ? 0 : v);
      }, 0);

      return accUser + userVotes;
    }, 0);
  }, [registrations, masterList]);

  // 2. Suma total de votos de toda la asamblea (Meta)
  const totalVotesSum = React.useMemo(() => {
    if (!masterList) return 0;

    return Object.values(masterList).reduce((acc, p) => {
      console.log(p);
      const vStr = String(p.Votos);
      const v = parseFloat(vStr.replace(',', '.'));
      return acc + (isNaN(v) ? 0 : v);
    }, 0);
  }, [masterList]);

  // Cálculo de Quórum basado en Coeficiente
  const quorum = React.useMemo(() => {
    if (totalCount === 0 || !registrations?.registrations) return 0;

    // 1. Sumamos coeficientes de las propiedades representadas (Check-ins)
    const currentSum = registrations.registrations.reduce((accUser, user) => {
      if (user.isDeleted || !user.representedProperties) return accUser;

      const userSum = user.representedProperties.reduce((accProp, prop) => {
        // En tu registro, guardaste el coeficiente como 'coefi' o lo sacamos del masterList
        const coefStr = prop.coefi || masterList[prop.ownerId]?.Coeficiente || masterList[prop.ownerId]?.coeficiente || "0";
        // Convertimos la cadena (ej. "0.054") a número de punto flotante
        const coef = parseFloat(coefStr.replace(',', '.'));
        return accProp + (isNaN(coef) ? 0 : coef);
      }, 0);

      return accUser + userSum;
    }, 0);

    // 2. Sumamos coeficientes de TODA la asamblea (Meta)
    const totalSum = Object.values(masterList).reduce((acc, p) => {
      const coefStr = String(p.Coeficiente || p.coeficiente || "0");
      const coef = parseFloat(coefStr.replace(',', '.'));
      return acc + (isNaN(coef) ? 0 : coef);
    }, 0);

    // 3. Calculamos el porcentaje
    if (totalSum === 0) return 0;

    // Si la suma total de coeficientes de tu asamblea es 100, la fórmula es (currentSum / 100) * 100.
    // Si la suma es 1 (ej. 0.05 + 0.10... = 1), la fórmula de abajo lo normaliza automáticamente.
    const percentage = (currentSum / totalSum) * 100;

    return percentage;
  }, [registrations, masterList, totalCount]);

  // --- URLS DE ACCESO ---
  const publicUrl = `${window.location.origin}/join/${assembly.id}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Enlace copiado al portapapeles");
  };

  const handleDownloadDirectQr = () => {
    const canvas = hiddenQrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${assembly.name || "Asamblea"}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-10">

      {/* 1. HEADER DINÁMICO */}
      <div className="flex flex-col items-start gap-2">
        <div className="w-full flex justify-between items-center">
          <CustomText variant="TitleL" as="h3" className="font-bold text-[#0E3C42]">
            {assembly.name}
          </CustomText>

          {assembly.statusID === "3" ? ( // Finished
            <CustomButton
              variant="primary"
              onClick={() => {/* Lógica exportar */ }}
              className="px-5 py-3 flex items-center gap-2"
            >
              <CustomIcon path={ICON_PATHS.fileSave} size={24} />
              <CustomText variant="labelL" className="font-bold text-[#0E3C42]">Exportar</CustomText>
            </CustomButton>
          ) : (
            <CustomButton
              variant="primary"
              onClick={() => setIsEditing(true)}
              className="px-5 py-3 flex items-center gap-2"
            >
              <CustomIcon path={ICON_PATHS.pencil} size={24} />
              <CustomText variant="labelL" className="font-bold text-[#0E3C42]">Editar configuración</CustomText>
            </CustomButton>
          )}
        </div>

        <div className="w-full flex items-center gap-4">
          <CustomText variant="bodyX" as="h5" className="font-medium text-[#0E3C42]">
            {entity.name}
          </CustomText>
          <div className="flex flex-row items-center gap-2 bg-[#FFFFFF] px-2 py-1 rounded-lg border border-gray-100">
            <CustomIcon path={ICON_PATHS.calendar} size={16} />
            <CustomText variant="labelM" className="font-medium text-[#00093F]">
              {formatShortDateWithMonth(assembly.date)} - {assembly.hour}
            </CustomText>
          </div>
          <CustomTypeAssembly type={assembly.typeId} />
          <CustomStates status={assembly.statusID} className="px-3 py-1 rounded-full" />
        </div>
      </div>

      {/* 2. CARDS DE ACCESO */}
      <div className="grid grid-cols-3 gap-8">
        {/* Acceso Asambleístas */}
        <div className="w-full flex flex-col gap-5 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <CustomText variant="bodyL" as="h6" className="font-bold text-[#0E3C42]">Acceso a Asambleistas</CustomText>
          <div className="relative flex items-center justify-between gap-2 border border-[#94A2FF] rounded-lg px-3 py-2 w-full">
            <CustomText variant="labelM" className="font-medium text-[#3D3D44] truncate">{publicUrl}</CustomText>
            <CustomButton onClick={() => copyToClipboard(publicUrl)} className="shrink-0 bg-transparent border-none hover:bg-transparent">
              <CustomIcon path={ICON_PATHS.copy} size={14} />
            </CustomButton>
          </div>
          <div className="flex items-center gap-2">
            <CustomButton variant="secondary" onClick={() => setShowQrModal(true)} className="flex-1 flex items-center justify-center gap-2 py-3 px-2">
              <CustomIcon path={ICON_PATHS.qr} size={16} />
              <CustomText variant="labelM" className="font-bold">Ver QR</CustomText>
            </CustomButton>
            <CustomButton variant="primary" onClick={handleDownloadDirectQr} className="flex-1 flex items-center justify-center gap-2 py-3 px-2">
              <CustomIcon path={ICON_PATHS.download} size={16} />
              <CustomText variant="labelM" className="font-bold">Descargar QR</CustomText>
            </CustomButton>
          </div>
        </div>

        {/* Acceso Funcionario */}
        <div className="w-full flex flex-col justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div>
            <CustomText variant="bodyL" as="h5" className="text-[#0E3C42] font-bold">Acceso al administrador</CustomText>
            <CustomText variant="labelL" className="text-[#0E3C42] font-medium mt-1">Aquí podrá ver la asistencia en tiempo real.</CustomText>
          </div>
          <div className="relative flex items-center justify-between gap-2 border border-[#94A2FF] rounded-lg px-3 py-2 w-full mt-4">
            <CustomText variant="labelM" className="font-medium text-[#3D3D44] truncate ">{`${publicUrl}/funcionario`}</CustomText>
            <CustomButton onClick={() => copyToClipboard(`${publicUrl}/funcionario`)} className="shrink-0 bg-transparent border-none hover:bg-transparent">
              <CustomIcon path={ICON_PATHS.copy} size={14} />
            </CustomButton>
          </div>
        </div>
      </div>

      {/* 3. BOTONES DE CONTROL DE FLUJO */}
      <div className="w-full grid grid-cols-3 gap-4 bg-white p-6 rounded-3xl border border-[#F3F6F9] shadow-soft justify-center items-center">
        <CustomButton
          disabled={assembly.statusID !== "1"}
          onClick={() => onUpdateStatus("2")}
          className={`flex-1 py-3 rounded-full flex items-center justify-center gap-2 border-2 
            ${assembly.statusID === "1" ? "bg-[#DAF0DC]  border-[#DAF0DC] hover:bg-[#DAF0DC]" : "bg-gray-100 border-gray-300"}`}
        >
          <CustomIcon path={ICON_PATHS.playArrow} size={20} />
          <CustomText variant="labelL" className="font-bold">
            {assembly.statusID === "1" ? "Iniciar Asamblea" : "Asamblea iniciada"}
          </CustomText>
        </CustomButton>

        <CustomButton
          disabled={assembly.statusID !== "2"}
          onClick={() => onToggleRegister(!assembly.registerIsOpen)}
          className={`flex-1  py-3 rounded-full flex items-center justify-center gap-2 border-2 
            ${assembly.registerIsOpen ? "bg-[#FFEDDD] border-[#FFEDDD] hover:bg-[#FFEDDD]" : "bg-[#DAF0DC]  border-[#DAF0DC] hover:bg-[#DAF0DC]"}`}
        >
          <CustomIcon path={assembly.registerIsOpen ? ICON_PATHS.wavingHand : ICON_PATHS.editSquare} size={20} />
          <CustomText variant="labelL" className="font-bold text-[#333333]">
            {assembly.registerIsOpen ? "Finalizar registros" : "Abrir registros"}
          </CustomText>
        </CustomButton>

        <CustomButton
          disabled={assembly.statusID !== "2"}
          onClick={() => onUpdateStatus("3")}
          className={`flex-1 py-3 rounded-full flex items-center justify-center gap-2 border-2 
            ${assembly.statusID === "2" ? "bg-[#FACCCD] border-[#FACCCD] hover:bg-[#FACCCD]" : "bg-gray-100 border-gray-300 hover:bg-gray-100"}`}
        >
          <CustomIcon path={ICON_PATHS.stop_circle} size={20} />
          <CustomText variant="labelL" className="font-bold">Finalizar asamblea</CustomText>
        </CustomButton>
      </div>

      {/* 4. ESTOS SON LSO QUE SE VEN EN FUNCIONARIO. EL QOURUM Y LOS DOS CUADROS DE REGISTRADOS Y BLOQUEADOS */}

      {/* 4. SECCIÓN DE ESTADÍSTICAS */}
      <div className="w-full grid grid-cols-2 justify-between gap-10 ">
        {/* Quórum */}
        <div className="w-full bg-[#FFFFFF] rounded-3xl p-6 gap-6 border border-[#F3F6F9] flex flex-col shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <CustomText variant="bodyX" as="h5" className="font-bold text-[#0E3C42]">Quórum</CustomText>
            <CustomIcon path={ICON_PATHS.error} size={24} />
          </div>
          <div className="flex flex-col items-center justify-center flex-1 relative py-2">
            <Quorum percentage={quorum} />
          </div>
        </div>

        {/* Asambleístas Boxes */}
        <div className="w-full bg-[#FFFFFF] rounded-3xl p-6 gap-6 border border-[#F3F6F9] flex flex-col shadow-soft">
          <CustomText variant="bodyX" as="h5" className="font-bold text-[#0E3C42]">Asambleístas</CustomText>
          <AssemblyStatsBoxes
            registeredCount={registeredVotesSum}
            totalCount={totalVotesSum}
            blockedCount={blockedCount}
          />
        </div>
      </div>

      {/* 5. MODALES Y ELEMENTOS OCULTOS */}
      <QrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        assembly={assembly}
      />
      <div style={{ display: "none" }} ref={hiddenQrRef}>
        <QRCodeCanvas value={publicUrl} size={1024} level={"H"} includeMargin={true} />
      </div>
    </div>
  );
}