"use client";

import React from "react";
import CustomText from "@/components/basics/CustomText";
import CustomOptionSelect from "@/components/basics/CustomOptionSelect";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function Step5ManualAdd({
    manualData,
    setManualData,
    availableTypes,
    availableGroups,
    availableProperties,
    getFieldLabel,
    assembly,
    onConfirm
}) {

    const handleUpdate = (field, value) => {
        setManualData(prev => ({ ...prev, [field]: value }));
    };

    // --- LÓGICA DE ORDENAMIENTO ALFANUMÉRICO ---
    const alphanumericSort = (a, b) => {
        if (!a) return -1;
        if (!b) return 1;
        return a.toString().localeCompare(b.toString(), undefined, {
            numeric: true,
            sensitivity: "base",
        });
    };

    // Creamos copias ordenadas para no mutar los props originales
    const sortedTypes = [...availableTypes].sort(alphanumericSort);
    const sortedGroups = [...availableGroups].sort(alphanumericSort);

    // Para las propiedades, ordenamos basándonos en el atributo específico del objeto
    const sortedProperties = [...availableProperties].sort((a, b) => {
        const propA = a.Propiedad || a.propiedad || "";
        const propB = b.Propiedad || b.propiedad || "";
        return alphanumericSort(propA, propB);
    });
    // -------------------------------------------

    const selectStyles = "w-full px-4 py-4 border border-[#D3DAE0] rounded-xl bg-white outline-none focus:border-black appearance-none text-[16px]";
    const containerStyles = "flex flex-col gap-2 w-full animate-in fade-in duration-300";
    const labelStyles = "font-bold text-[#333333] text-[14px] ml-1";

    const showGroup = availableGroups.length > 0 && (availableTypes.length <= 1 || manualData.type);
    const showProperty = (availableGroups.length === 0 || manualData.group) && (availableTypes.length <= 1 || manualData.type);
    const showRole = manualData.registry;

    return (
        <div className="flex flex-col items-center w-full gap-6 animate-in fade-in slide-in-from-bottom-4 max-w-[455px]">
            <div className="text-center flex flex-col gap-2 mb-4">
                <CustomText variant="TitleL" className="text-[#0E3C42] font-bold">Añade la propiedad adicional</CustomText>
            </div>

            <div className="w-full flex flex-col gap-5">
                {/* 1. SELECTOR DE TIPO */}
                {sortedTypes.length > 1 && (
                    <div className={containerStyles}>
                        <label className={labelStyles}>{getFieldLabel("Tipo")} *</label>
                        <select
                            className={selectStyles}
                            value={manualData.type}
                            onChange={(e) => {
                                handleUpdate("type", e.target.value);
                                handleUpdate("group", ""); // Limpiar hijos al cambiar padre
                                handleUpdate("registry", null);
                            }}
                        >
                            <option key="def-type" value="">Selecciona el tipo</option>
                            {sortedTypes.map((t, index) => (
                                <option key={`type-${t}-${index}`} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* 2. SELECTOR DE GRUPO */}
                {showGroup && (
                    <div className={containerStyles}>
                        <label className={labelStyles}>{getFieldLabel("Grupo")} *</label>
                        <select
                            className={selectStyles}
                            value={manualData.group}
                            onChange={(e) => {
                                handleUpdate("group", e.target.value);
                                handleUpdate("registry", null); // Limpiar propiedad al cambiar grupo
                            }}
                        >
                            <option key="def-group" value="">Selecciona {getFieldLabel("Grupo").toLowerCase()}</option>
                            {sortedGroups.map((g, index) => (
                                <option key={`group-${g}-${index}`} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* 3. SELECTOR DE PROPIEDAD */}
                {showProperty && (
                    <div className={containerStyles}>
                        <label className={labelStyles}>{getFieldLabel("Propiedad")} *</label>
                        <select
                            className={selectStyles}
                            value={manualData.registry?.id || ""}
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                const reg = sortedProperties.find(p => p.id === selectedId);
                                handleUpdate("registry", reg);
                            }}
                        >
                            <option key="def-prop" value="">Selecciona {getFieldLabel("Propiedad").toLowerCase()}</option>
                            {sortedProperties.map((p, index) => (
                                <option key={`prop-${p.id}-${index}`} value={p.id}>
                                    {p.Propiedad || p.propiedad}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* 4. SELECCIÓN DE PARTICIPACIÓN */}
                {showRole && (
                    <div className="flex flex-col gap-6 animate-in fade-in pt-4 border-t border-gray-100">
                        <div className="flex flex-col gap-3">
                            <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">Seleccione su participación</CustomText>
                            <CustomOptionSelect
                                value={manualData.role}
                                onChange={(v) => handleUpdate("role", v)}
                                classContentOptions="flex flex-col gap-3"
                                options={[
                                    { label: "Como propietario", value: "owner" },
                                    { label: "Como apoderado", value: "proxy" },
                                ]}
                            />
                        </div>

                        {manualData.role === "proxy" && assembly.typeId !== "1" && (
                            <div className="relative border-2 border-dashed border-[#8B9DFF]/30 rounded-[24px] p-6 flex flex-col items-center bg-slate-50/50">
                                <CustomIcon path={manualData.file ? ICON_PATHS.check : ICON_PATHS.uploadFile} size={32} className={manualData.file ? "text-green-500" : "text-[#6A7EFF]"} />
                                <CustomText variant="labelM" className="font-bold mt-2">{manualData.file ? "¡Poder cargado!" : "Cargar carta poder"}</CustomText>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpdate("file", e.target.files[0])} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CustomButton
                variant="primary"
                onClick={onConfirm}
                disabled={!manualData.registry}
                className="py-4 w-full font-bold"
            >
                Añadir Propiedad
            </CustomButton>
        </div>
    );
}