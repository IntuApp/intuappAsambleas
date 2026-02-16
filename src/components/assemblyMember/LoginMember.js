import React, { useState } from "react";
import { User, LogIn, AlertTriangle, Video } from "lucide-react";
import { toast } from "react-toastify";
import CustomText from "../basics/CustomText";
import CustomTypeAssembly from "../basics/CustomTypeAssembly";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import AssemblyStatus from "../assemblies/AssemblyStatus";
import CustomStates from "../basics/CustomStates";
import { formatDateTime } from "@/lib/utils";

export default function LoginMember({ assembly, entity, onLogin }) {
  const isActive =
    assembly.status === "started" || assembly.status === "registries_finalized";
  const isFinalized = assembly.status === "finished";

  console.log(new Date(assembly.date), assembly.hour);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 bg-[#F8F9FB] font-sans">
      <div className="w-full max-w-[1240px] rounded-none overflow-hidden flex flex-col md:flex-row h-screen md:h-[680px] relative">
        {/* Left Side Content */}
        <div className="w-full md:w-[50%] p-2 md:p-16 flex flex-col justify-center relative overflow-visible order-2 md:order-1">
          <div className="w-full max-w-[500px] mx-auto flex flex-col gap-10">
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

            {/* Assembly Info Card */}
            <div className="bg-white border border-[#F0F0F0] rounded-3xl p-7 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-4">
                <CustomText
                  as="h5"
                  variant="bodyX"
                  className="text-[#0E3C42] font-bold"
                >
                  {assembly.name}
                </CustomText>
                <div className="flex flex-col">
                  <CustomText
                    variant="LabelL"
                    className="font-normal text-[#3D3D44]"
                  >
                    {entity?.name}
                  </CustomText>
                  <CustomText
                    variant="LabelL"
                    className="font-normal text-[#3D3D44]"
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
            ) : (
              <>
                {isActive ? (
                  <div className="flex flex-col gap-4">
                    <CustomButton
                      variant="primary"
                      onClick={() => onLogin()}
                      className="w-full flex py-3 justify-center items-center gap-1"
                    >
                      <CustomIcon path={ICON_PATHS.person} size={24} />
                      <CustomText variant="bodyM" className="font-bold">
                        Ingresar
                      </CustomText>
                    </CustomButton>

                    {assembly.status === "registries_finalized" && (
                      <div className="bg-[#FFEDDD] border border-[#F98A56] p-4 rounded-xl flex gap-3 items-start">
                        <CustomIcon
                          path={ICON_PATHS.warning}
                          size={16}
                          className="text-[#F98A56] shrink-0 mt-0.5"
                        />
                        <div className="flex flex-col gap-0.5">
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
                ) : (
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
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side - Brand View */}
        <div className="flex-1 bg-[linear-gradient(135deg,#BFE6E2_40%,#CDE3F0_55%,#C9CDF4_100%)] md:rounded-[24px] flex flex-col items-center justify-center p-12 relative overflow-hidden order-1 md:order-2">
          <div
            className="absolute rounded-full blur-[20px]"
            style={{
              left: "-50px",
              bottom: "-100px",
              width: "150px",
              height: "150px",
              background: "#F3F6F9",
              transform: "rotate(8.32deg)",
            }}
          />
          <div
            className="absolute rounded-full blur-[20px]"
            style={{
              right: "-70px",
              top: "-100px",
              width: "153px",
              height: "153px",
              background: "#F3F6F9",
              transform: "rotate(90deg)",
            }}
          />
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="flex items-center gap-5">
              {/* Custom CSS Logo Icon (Stylized A/Stack) */}
              <img src="/logos/assambly/iconLoginAssambly.png" alt="Logo" />
            </div>
            <p className="text-[#0E3C42] font-semibold text-[22px] tracking-tight opacity-90 mt-[-10px]">
              Lo complejo hecho simple
            </p>
          </div>

          {/* Decorative elements to match the gradient feel */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/30 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </div>
  );
}
