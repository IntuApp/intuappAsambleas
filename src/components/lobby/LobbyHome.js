"use client";

import React, { useMemo } from "react";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import CustomTypeAssembly from "../basics/CustomTypeAssembly";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function LobbyHome({
  currentUser,
  assembly,
  entity,
  onJoinMeeting,
  quorumPercentage = 0,
  totalVotosRegistrados = 0,
  totalVotosAsamblea = 0,
  masterList,
  blockedProperties = [] // Array con los IDs de las propiedades bloqueadas
}) {

  // 1. LÓGICA DE PROPIEDADES BLOQUEADAS
  // Extraemos las propiedades del usuario actual
  const userProperties = currentUser?.representedProperties || [];

  // Filtramos cuáles de las propiedades de este usuario están en la lista de bloqueadas del administrador
  const userBlockedProps = useMemo(() => {
    return userProperties.filter(prop => blockedProperties.includes(prop.ownerId));
  }, [userProperties, blockedProperties]);

  const isTotallyBlocked = userProperties.length === 1 && userBlockedProps.length === 1;
  const isPartiallyBlocked = userProperties.length > 1 && userBlockedProps.length > 0;

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300 px-10">

      <div className="md:grid grid-cols-2">
        <CustomText variant="Title" className="text-[#0E3C42]">
          Hola, {currentUser?.firstName || "Asambleísta"}!
        </CustomText>
        <div className="flex flex-col justify-between overflow-hidden ">
          {/* Botón de videollamada (Oculto si es Presencial) */}
          {assembly?.typeId !== "1" && assembly?.type !== "Presencial" && (
            <div className="flex justify-end mt-auto pt-4 ">
              <CustomButton
                onClick={onJoinMeeting}
                disabled={assembly?.statusID !== "2"} // 2 = Iniciada/Live
                variant="primary"
                className="w-1/2 flex items-center justify-center gap-3 py-3"
              >
                <CustomIcon path={ICON_PATHS.videoCam} className="text-[#000000]" size={20} />
                <CustomText variant="labelL" className="font-bold">
                  Unirse a la videollamada
                </CustomText>
              </CustomButton>
              {assembly?.statusID !== "2" && (
                <p className="text-center text-xs text-gray-400 font-bold mt-2">
                  {assembly?.statusID === "3" ? "La reunión ya finalizó" : "La reunión no ha iniciado"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {/* 1. Saludo */}


      {/* 2. Grid Superior: Info de Asamblea y Videollamada */}
      <div className="gap-6 w-full">

        {/* Card Izquierda: Info de la Asamblea */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col justify-evenly h-[220px] relative overflow-hidden">
          <div className="absolute flex justify-end right-0 top-0 w-1/2 h-full opacity-50">
            <img src="/logos/decorations/figureTwo.png" alt="Decoración" className="object-cover h-full" />
          </div>

          <div className="flex flex-col items-start gap-1">
            <CustomText variant="SubTitle" className="text-[#0E3C42] font-bold">
              Asamblea {assembly?.name}
            </CustomText>
            <CustomText variant="bodyL" className="text-[#3D3D44]">
              {entity?.name}
            </CustomText>
            <CustomText variant="bodyL" className="text-[#3D3D44]">
              {assembly?.date} - {assembly?.hour}
            </CustomText>
          </div>
          <div className="flex justify-start mt-2">
            <CustomTypeAssembly type={assembly?.typeId || assembly?.type} className="py-3 px-4" />
          </div>
        </div>
      </div>



      {/* 3. MENSAJES DE RESTRICCIÓN DE VOTO */}
      {isTotallyBlocked && (
        <div className="bg-[#FACCCD] border border-[#930002] rounded-3xl p-6 flex items-center gap-4">
          <CustomIcon path={ICON_PATHS.emergencyHome} size={32} className="text-[#930002]" />
          <CustomText variant="bodyM" className="text-[#930002] font-bold">
            No estás habilitado para votar. Tu propiedad se encuentra restringida en esta asamblea.
          </CustomText>
        </div>
      )}

      {isPartiallyBlocked && !isTotallyBlocked && (
        <div className="bg-[#FFF0E6] border border-[#FF8A35] rounded-3xl p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <CustomIcon path={ICON_PATHS.info} size={24} className="text-[#FF8A35]" />
            <CustomText variant="bodyM" className="text-[#933D00] font-bold">
              Las siguientes propiedades que representas no están habilitadas para votar:
            </CustomText>
          </div>
          <div className="flex flex-col gap-1 pl-9">
            {userBlockedProps.map((prop, idx) => {
              console.log(prop);
              const excelInfo = masterList[prop.ownerId]
              console.log(excelInfo);
              const tipo = excelInfo.Tipo || excelInfo.tipo || "";
              const grupo = excelInfo.Grupo || excelInfo.grupo || "";
              const propiedadNombre = excelInfo.Propiedad || excelInfo.propiedad || prop.ownerId;

              // Asumiendo que masterList guarda la info de Grupo/Tipo por ownerId. 
              // Si el lobby ya tiene esa info, la mostramos. Si no, mostramos el ID o el nombre de la propiedad.
              return <CustomText key={idx} variant="labelM" className="text-[#333333] font-medium">

                • Propiedad: {tipo} {grupo} {propiedadNombre}
              </CustomText>
            })}
          </div>
        </div>
      )}

      {/* 4. SECCIÓN DE ASISTENCIA */}
      <div className="flex flex-col gap-4 mt-2">
        <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
          Asistencia
        </CustomText>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta Quórum */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between gap-2">
                <CustomText variant="bodyX" className="text-[#1F1F23] font-medium">Quórum</CustomText>
                <div className="bg-[#EEF0FF] p-2 rounded-xl">
                  <CustomIcon path={ICON_PATHS.donutSmall} className="text-[#6A7EFF]" size={24} />
                </div>
              </div>
              <CustomText variant="TitleL" className="text-[#1F1F23] font-black mt-2">
                {quorumPercentage.toFixed(2)}%
              </CustomText>
              <CustomText variant="bodyM" className="text-[#8E8E93]">
                porcentaje de registrados
              </CustomText>
            </div>
          </div>

          {/* Tarjeta Asistencia Numérica */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between gap-2">
                <CustomText variant="bodyX" className="text-[#1F1F23] font-medium">Asistencia</CustomText>
                <div className="bg-[#EEF0FF] p-2 rounded-xl">
                  <CustomIcon path={ICON_PATHS.inPerson} className="text-[#6A7EFF]" size={24} />
                </div>
              </div>
              <CustomText variant="TitleL" className="text-[#1F1F23] font-black mt-2">
                {totalVotosRegistrados.toLocaleString()} / {totalVotosAsamblea.toLocaleString()}
              </CustomText>
              <CustomText variant="bodyM" className="text-[#8E8E93]">
                asambleístas registrados
              </CustomText>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}