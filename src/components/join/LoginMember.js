"use client";

import React from "react";
import CustomText from "../basics/CustomText";
import CustomTypeAssembly from "../basics/CustomTypeAssembly";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomStates from "../assemblies/CustomStates";
import { formatDateTime } from "@/lib/utils";

export default function LoginMember({ assembly, entity, onLogin }) {
  // --- LÓGICA DE ESTADOS BASADA EN DB ---
  const isScheduled = assembly.statusID === "1"; // Agendada
  const isActive = assembly.statusID === "2";    // En vivo
  const isFinalized = assembly.statusID === "3"; // Finalizada
  const registerClosed = assembly.registerIsOpen === false;

  return (
    <div className="min-h-screen w-full flex items-center justify-center ">
      {/* Tarjeta Maestra Proporcional */}
      <div className="w-full min-h-screen h-full rounded-[40px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden flex flex-row justify-center">

        {/* LADO IZQUIERDO: INFORMACIÓN Y ACCESO */}
        <div className=" p-8 md:p-16 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col gap-8 rounded-3xl p-7">

            <div className="w-full gap-2 flex flex-col">
              <CustomText
                as="h1"
                variant="TitleX"
                className="font-bold text-[#0E3C42]"
              >
                Hola, asambleísta!
              </CustomText>
              {!isFinalized && (
                <CustomText
                  variant="bodyL"
                  className="text-[#1F1F23] font-regular"
                >
                  Accede a tu cuenta y disfruta de todos nuestros servicios.
                </CustomText>
              )}
            </div>
            <div className="relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-2 p-3 bg-white rounded-3xl shadow-sm border border-[#F3F6F9]">
                <CustomText
                  as="h5"
                  variant="bodyX"
                  className="text-[#0E3C42] font-bold"
                >
                  {assembly.name}
                </CustomText>
                <div className="flex flex-col">
                  <CustomText
                    variant="bodyM"
                    className="font-regular text-[#3D3D44]"
                  >
                    {entity?.name}
                  </CustomText>
                  <CustomText
                    variant="bodyM"
                    className="font-regular text-[#3D3D44]"
                  >
                    {formatDateTime(assembly.date) + " - " + assembly.hour}
                  </CustomText>
                </div>

                <div className="flex items-center gap-2">
                  <CustomTypeAssembly
                    type={assembly.type}
                    className="px-3 py-2"
                  />
                  {isFinalized && (
                    <CustomStates status="finished" className="px-4 py-2 " />
                  )}
                </div>
              </div>
            </div>

            {/* ZONA DE INTERACCIÓN DINÁMICA */}
            <div className="max-w-[455px]">
              {isFinalized ? (
                <div className="bg-white border border-[#F0F0F0] p-6 rounded-2xl flex gap-4 items-center shadow-sm">
                  <div className="bg-[#EEF0FF] p-2 rounded-lg">
                    <CustomIcon
                      path={ICON_PATHS.checkBox}
                      size={30}
                      className="text-[#6A7EFF]"
                    />
                  </div>
                  <CustomText variant="labelL" className="font-bold">
                    Esta asamblea ha finalizado.
                  </CustomText>
                </div>
              ) : isActive ? (
                <div className="flex flex-col gap-4">
                  <CustomButton
                    variant="primary"
                    onClick={onLogin}
                    className="w-full flex py-3 justify-center items-center gap-1"
                  >
                    <CustomIcon path={ICON_PATHS.person} size={24} />
                    <CustomText variant="bodyM" className="font-bold">
                      Ingresar
                    </CustomText>
                  </CustomButton>

                  {registerClosed && (
                    <div className="bg-[#FFEDDD] border border-[#F98A56] p-4 rounded-xl flex gap-3 items-start">
                      <CustomIcon
                        path={ICON_PATHS.warning}
                        size={16}
                        className="text-[#F98A56] shrink-0"
                      />
                      <div className="flex flex-col gap-1">
                        <CustomText
                          variant="bodyS"
                          className="font-bold text-[#0E3C42]"
                        >
                          Registro finalizado!
                        </CustomText>
                        <CustomText
                          variant="labelM"
                          className="font-regular text-[#333333]"
                        >
                          Gracias por querer participar en esta asamblea, pero
                          el registro de los asambleístas ha finalizado.
                          Comunicate con tu administrador o funcionario si
                          tienes alguna duda.
                        </CustomText>
                      </div>
                    </div>
                  )}
                </div>
              ) : isScheduled ? (
                <div className="bg-white border border-[#F0F0F0] p-6 rounded-2xl flex gap-4 items-center shadow-sm">
                  <div className="bg-[#EEF0FF] p-2 rounded-lg">
                    <CustomIcon
                      path={ICON_PATHS.campaign}
                      size={30}
                      className="text-[#6A7EFF]"
                    />
                  </div>
                  <CustomText variant="labelL" className="font-bold">
                    Esta asamblea aun no inicia.
                  </CustomText>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className=" max-w-[652px] w-full p-6 py-10 bg-[#F8F9FB]">
          <div className="w-full h-full relative rounded-[32px] overflow-hidden flex flex-col items-center justify-center shadow-inner">
            <img src="/bg/bg.png" alt="Branding" className="absolute inset-0 w-full h-full object-cover rounded-3xl" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#BFE6E2]/40 via-transparent to-[#C9CDF4]/40" />

            <div className="relative z-10 flex flex-col items-center gap-2  max-w-[80%]">
              <img
                src="/logos/assambly/iconLoginAssambly.png"
                alt="IntuApp"
                className="w-30 drop-shadow-md"
              />
              <div className="flex flex-col gap-2 items-center">
                <CustomText variant="bodyX" className="text-[#0E3C42] font-medium text-center">
                  Lo complejo hecho simple
                </CustomText>
              </div>
            </div>

            {/* Decoraciones de luz */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/40 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#4059FF]/20 rounded-full blur-[100px]" />
          </div>
        </div>

      </div>
    </div>
  );
}