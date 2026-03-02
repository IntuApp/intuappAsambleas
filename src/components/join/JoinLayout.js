"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import ProgressBar from "./ProgressBar"; // El componente de barra que ya tienes
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";

export default function JoinLayout({
    children,
    currentStep,
    totalSteps = 8,
    onBack
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FB] p-4 md:p-6 font-sans">
            <div className="w-full max-w-[70%]  bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-6 md:p-12 flex flex-col relative overflow-hidden">
                <div className="w-full flex items-center justify-between mb-10">
                    <CustomButton
                        onClick={onBack}
                        className="p-2 bg-transparent hover:bg-slate-50 border-none rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-[#838383]" />
                    </CustomButton>

                    {/* Barra de Progreso Central */}
                    <div className="flex-1 w-full px-8">
                        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
                    </div>

                    {/* Indicador de Paso */}
                    <div className="bg-[#D5DAFF] px-5 py-2 rounded-full whitespace-nowrap shadow-sm border border-[#BFC8FF]">
                        <CustomText variant="labelS" className="text-[#00093F] font-bold">
                            Paso {currentStep + 1} de {totalSteps}
                        </CustomText>
                    </div>
                </div>

                {/* CONTENIDO DEL PASO (Centrado) */}
                <div className="flex-1 flex flex-col items-center justify-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-full max-w-[520px] flex flex-col items-center justify-center">
                        {children}
                    </div>
                </div>

                {/* Decoración sutil de fondo para mantener el estilo de marca */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#BFE6E2]/10 rounded-full blur-[80px] -z-10" />
            </div>
        </div>
    );
}