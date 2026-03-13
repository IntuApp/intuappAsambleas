"use client";

import React, { useState } from "react";
import { User, LogOut, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, ChevronDown } from "lucide-react";

// Componentes Base (Ajusta las rutas si es necesario)
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomTypePropertie from "@/components/join/CustomTypePropertie";

export default function LobbyProfile({ currentUser, masterList, onLogout }) {
    // Estado local exclusivo para el ordenamiento de esta vista
    const [sortPropertiesBy, setSortPropertiesBy] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Ajusta cuántas propiedades quieres por página

    // Sumatoria del coeficiente total del usuario
    const totalCoeff = (currentUser?.representedProperties || []).reduce((acc, r) => {
        const val = r.coefi || masterList[r.ownerId]?.Coeficiente || masterList[r.ownerId]?.coeficiente || "0";
        return acc + parseFloat(String(val).replace(",", "."));
    }, 0).toFixed(2);

    // Lógica de ordenamiento
    const getSortedProperties = () => {
        let propertiesToRender = [...(currentUser?.representedProperties || [])];

        if (sortPropertiesBy === "coeff") {
            propertiesToRender.sort((a, b) => {
                const valA = parseFloat(String(a.coefi || masterList[a.ownerId]?.Coeficiente || "0").replace(",", "."));
                const valB = parseFloat(String(b.coefi || masterList[b.ownerId]?.Coeficiente || "0").replace(",", "."));
                return valB - valA;
            });
        } else if (sortPropertiesBy === "name") {
            propertiesToRender.sort((a, b) => {
                const nameA = String(masterList[a.ownerId]?.Propiedad || a.ownerId).toLowerCase();
                const nameB = String(masterList[b.ownerId]?.Propiedad || b.ownerId).toLowerCase();
                return nameA.localeCompare(nameB);
            });
        }

        return propertiesToRender;
    };
    const sortedProperties = getSortedProperties();
    const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);

    // Propiedades que se verán en la página actual
    const currentProperties = sortedProperties.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Solo mostrar paginación si hay más de una página
    const showPagination = totalPages > 1;

    return (
        <div className="flex flex-col items-center justify-center gap-6 px-10">

            <div className="max-w-[550px] mx-auto bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/20 border border-gray-100 flex flex-col items-start gap-3 text-start relative overflow-hidden">
                <div className="flex items-start gap-2">
                    <div className="bg-[#EEF0FF] p-2 rounded-full">
                        <CustomIcon
                            path={ICON_PATHS.accountCircle}
                            size={56}
                            className="text-[#6A7EFF]"
                        />
                    </div>
                    <div>
                        <CustomText
                            variant="TitleL"
                            className="text-[#0E3C42] font-bold"
                        >
                            {currentUser?.firstName} {currentUser?.lastName}
                        </CustomText>
                        <CustomText
                            variant="bodyX"
                            className="text-[#0E3C42] font-regular"
                        >
                            Código de ingreso: {currentUser?.mainDocument}
                        </CustomText>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 w-full">
                    <CustomButton
                        variant="secondary"
                        onClick={onLogout}
                        className=" flex items-center gap-2 py-2 px-4"
                    >
                        <CustomIcon path={ICON_PATHS.exit} size={18} />
                        <CustomText variant="labelL" className="font-bold">
                            Cerrar sesión
                        </CustomText>
                    </CustomButton>


                </div>
            </div>

            {/* PROPERTIES SECTION */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border w-full border-gray-100 mt-6 gap-6">

                <div className="flex flex-col text-start flex-col-reverse md:flex-row justify-between md:items-center md:items-center md:gap-4 mb-10 w-full">
                    <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">
                        Propiedades
                    </CustomText>

                    <div className="flex justify-end">
                        <div className="md:max-w-[151px]">
                        <select
                            value={sortPropertiesBy}
                            onChange={(e) => setSortPropertiesBy(e.target.value)}
                            className="w-[151px] min-h-[48px] border rounded-2xl px-5 py-4 outline-none font-bold text-[#0E3C42] text-sm appearance-none cursor-pointer">
                            <option>Ordenar por</option>
                            <option>Nombre</option>
                            <option>Coeficiente</option>
                        </select>
                    </div>
                    </div>
                </div>

                {/* COEFF BANNER */}
                <div className="bg-[#F3F6F9] rounded-2xl px-4 py-2 flex justify-between items-center mb-10 border border-[#DBE2E8]">
                    <CustomText variant="bodyL" className="text-[#1F1F23] ">
                        Coeficiente total
                    </CustomText>
                    <CustomText
                        variant="bodyX"
                        className="text-[#1F1F23] font-bold"
                    >
                        {totalCoeff}%
                    </CustomText>
                </div>
                {/* GRID DE PROPIEDADES */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {currentProperties.map((reg, idx) => {
                        const isProxy = reg?.role?.toLowerCase() === "proxy" || reg?.role?.toLowerCase() === "apoderado";
                        const excelInfo = masterList[reg.ownerId] || {};
                        const tipo = excelInfo.Tipo || excelInfo.tipo || "";
                        const grupo = excelInfo.Grupo || excelInfo.grupo || "";
                        const propiedadNombre = excelInfo.Propiedad || excelInfo.propiedad || reg.ownerId;
                        const coefVisual = reg.coefi || excelInfo.Coeficiente || excelInfo.coeficiente || "0";

                        return (
                            <div key={idx} className="py-3 px-4 rounded-2xl md:max-w-[344px] border border-[#DBE2E8]">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50/50 flex items-center justify-center text-[#8B9DFF]">
                                        <CustomTypePropertie type={tipo.toLowerCase()} className="p-2" />
                                    </div>

                                    <div className="flex-1 flex flex-col gap-0">
                                        <CustomText variant="bodyM" className="font-bold truncate">
                                            {tipo && tipo !== "-" ? `${tipo} - ` : ""}
                                            {grupo && grupo !== "-" ? `${grupo} - ` : ""}
                                            {propiedadNombre}
                                        </CustomText>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <CustomText
                                                variant="bodyS"
                                                className={`font-medium px-2 py-1 rounded-full ${isProxy
                                                    ? "text-[#00093F] bg-[#D5DAFF] "
                                                    : "text-[#0E3C42] bg-[#B8EAF0]"
                                                    }`}
                                            >
                                                {isProxy ? "Apoderado" : "Propietario"}
                                            </CustomText>

                                            <CustomText variant="bodyS">
                                                Coeficiente:{" "}
                                                <strong className="">
                                                    {String(coefVisual).slice(0, 4)}%
                                                </strong>
                                            </CustomText>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* PAGINATION (Visual) */}
                {showPagination && (
                    <div className="flex flex-wrap justify-end items-center gap-2 mt-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(1)}
                            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 disabled:opacity-30"
                        >
                            <ChevronsLeft size={16} />
                        </button>

                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 disabled:opacity-30"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-full transition font-bold text-sm ${currentPage === i + 1
                                            ? "bg-[#8B9DFF] text-white"
                                            : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="h-10 px-4 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#0E3C42] transition font-bold text-xs uppercase tracking-widest gap-2 disabled:opacity-30"
                        >
                            Siguiente <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}