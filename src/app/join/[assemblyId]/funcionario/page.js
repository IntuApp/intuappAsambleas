"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

// Métodos de lógica de BD
import { listenToAssemblyLive, getEntityMasterList } from "@/lib/assembly";
import { listenToEntityById } from "@/lib/entity";

// Componentes de UI
import Loader from "@/components/basics/Loader";
import CustomText from "@/components/basics/CustomText";
import CustomTypeAssembly from "@/components/basics/CustomTypeAssembly";
import CustomStates from "@/components/assemblies/CustomStates";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import Quorum from "@/components/assemblies/Quorum";
import AssemblyStatsBoxes from "@/components/assemblies/AssemblyStatsBoxes";
import AttendanceTable from "@/components/assemblies/AttendanceTable";
import { Users, AlertTriangle, ShieldCheck, Trophy, Info } from "lucide-react";
import CustomButton from "@/components/basics/CustomButton";

const FuncionarioPage = () => {
    const { assemblyId } = useParams();

    // Estados de datos
    const [assemblyData, setAssemblyData] = useState(null);
    const [entityData, setEntityData] = useState(null);
    const [registrations, setRegistrations] = useState(null);
    const [masterList, setMasterList] = useState({});

    // Estados de UI
    const [activeTab, setActiveTab] = useState("Asambleistas");

    // 🔥 ESTOS SON LOS ESTADOS QUE USA EL ATTENDANCE TABLE
    const [tableFilter, setTableFilter] = useState("Registrados");
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Efecto principal para escuchar datos (Misma lógica del Operador)
    useEffect(() => {
        if (!assemblyId) return;

        // Escuchar la Asamblea y los Registros (Check-ins/Bloqueos) en tiempo real
        const unsubscribeLive = listenToAssemblyLive(assemblyId, async (data) => {
            if (!data) {
                toast.error("La asamblea no existe");
                return;
            }

            setAssemblyData(data.assembly);
            setRegistrations(data.registrations);

            // Una vez tenemos la asamblea, cargamos la entidad y la lista maestra
            if (data.assembly.entityId && Object.keys(masterList).length === 0) {
                const unsubscribeEntity = listenToEntityById(data.assembly.entityId, async (ent) => {
                    setEntityData(ent);
                    if (ent?.assemblyRegistriesListId) {
                        const master = await getEntityMasterList(ent.assemblyRegistriesListId);
                        setMasterList(master);
                    }
                });

                // Retornamos la desuscripción de la entidad también
                return () => {
                    unsubscribeLive();
                    unsubscribeEntity();
                }
            }
        });

        return () => unsubscribeLive();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assemblyId]);

    // 2. Cálculo de Estadísticas (Idénticas a tu AssemblyLiveManager)
    const totalCount = Object.keys(masterList || {}).length || 0;
    const blockedCount = registrations?.blockedProperties?.length || 0;

    // Calculamos el número de PROPIEDADES registradas
    const registeredPropertiesCount = useMemo(() => {
        if (!registrations?.registrations) return 0;
        let count = 0;
        registrations.registrations.forEach(user => {
            if (!user.isDeleted && user.representedProperties) {
                count += user.representedProperties.length;
            }
        });
        return count;
    }, [registrations]);

    // Cálculo de Quórum basado en Coeficiente
    const quorum = useMemo(() => {
        if (totalCount === 0 || !registrations?.registrations) return 0;

        // Sumamos coeficientes de las propiedades representadas (Check-ins)
        const currentSum = registrations.registrations.reduce((accUser, user) => {
            if (user.isDeleted || !user.representedProperties) return accUser;

            const userSum = user.representedProperties.reduce((accProp, prop) => {
                const coefStr = prop.coefi || masterList[prop.ownerId]?.Coeficiente || masterList[prop.ownerId]?.coeficiente || "0";
                const coef = parseFloat(String(coefStr).replace(',', '.'));
                return accProp + (isNaN(coef) ? 0 : coef);
            }, 0);

            return accUser + userSum;
        }, 0);

        // Sumamos coeficientes de TODA la asamblea (Meta)
        const totalSum = Object.values(masterList).reduce((acc, p) => {
            const coefStr = String(p.Coeficiente || p.coeficiente || "0");
            const coef = parseFloat(coefStr.replace(',', '.'));
            return acc + (isNaN(coef) ? 0 : coef);
        }, 0);

        if (totalSum === 0) return 0;
        return (currentSum / totalSum) * 100;
    }, [registrations, masterList, totalCount]);


    if (!assemblyData || !entityData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col">

            {/* ---------------- HEADER ---------------- */}
            <header className="bg-white border-b border-gray-100 py-4 px-10 flex justify-between items-center sticky top-0 z-50">
                <div className="px-8 flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                        <img src="/logos/assambly/iconLogo.png" alt="Logo" className="h-8 w-auto md:h-8" />
                    </div>
                    <div className="flex items-center gap-2">
                        <CustomText variant="labelS" className="font-black text-[#0E3C42] ">
                            Invitado
                        </CustomText>
                        <span className="text-gray-400">|</span>
                        <CustomText variant="labelS" className="font-medium text-[#0E3C42]">
                            Administrador
                        </CustomText>
                        <div className="p-1 bg-[#ABE7E5] rounded-full">
                            <CustomIcon path={ICON_PATHS.accountCircle} size={20} className="text-[#1C6168]" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-10 py-10 gap-2">
                <div className="flex flex-col items-start gap-2 pb-4 px-8">
                    <div className="w-full flex justify-between items-center">
                        <CustomText variant="TitleL" as="h3" className="font-bold text-[#0E3C42]">
                            {assemblyData.name}
                        </CustomText>
                    </div>

                    <div className="w-full flex items-center gap-4">
                        <CustomText variant="bodyX" as="h5" className="font-medium text-[#0E3C42]">
                            {entityData.name}
                        </CustomText>
                        <div className="flex flex-row items-center gap-2 bg-[#FFFFFF] px-2 py-1 rounded-lg border border-gray-100">
                            <CustomIcon path={ICON_PATHS.calendar} size={16} />
                            <CustomText variant="labelM" className="font-medium text-[#00093F]">
                                {assemblyData.date} - {assemblyData.hour}
                            </CustomText>
                        </div>
                        <CustomTypeAssembly type={assemblyData.typeId} />
                        <CustomStates status={assemblyData.statusID} className="px-3 py-1 rounded-full" />
                    </div>
                </div>


                {/* ---------------- TOP CARDS (QUORUM & STATS) ---------------- */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 justify-between gap-6 md:gap-10 mb-10 px-8">
                    {/* Quórum */}
                    <div className="w-full bg-[#FFFFFF] rounded-3xl p-6 gap-6 border border-[#F3F6F9] flex flex-col shadow-soft">
                        <div className="flex justify-between items-start mb-4">
                            <CustomText variant="bodyX" as="h5" className="font-bold text-[#0E3C42]">Quórum</CustomText>
                            <CustomIcon path={ICON_PATHS.error} size={24} className="text-[#0E3C42]" />
                        </div>
                        <div className="flex flex-col items-center justify-center flex-1 relative py-2">
                            <Quorum percentage={quorum} />
                        </div>
                    </div>

                    {/* Asambleístas Boxes */}
                    <div className="w-full bg-[#FFFFFF] rounded-3xl p-6 gap-6 border border-[#F3F6F9] flex flex-col shadow-soft">
                        <CustomText variant="bodyX" as="h5" className="font-bold text-[#0E3C42]">Asambleístas</CustomText>
                        <div className="flex-1 flex flex-col justify-center">
                            <AssemblyStatsBoxes
                                registeredCount={registeredPropertiesCount}
                                totalCount={totalCount}
                                blockedCount={blockedCount}
                            />
                        </div>
                    </div>
                </div>


                <div className="w-full bg-[#FFFFFF] rounded-full p-2 border border-[#F3F6F9] flex flex-row gap-1 mx-8 mb-8">
                    <CustomButton
                        onClick={() => setActiveTab("Asambleistas")}
                        className={`flex-1 py-3 ${activeTab === "Asambleistas" ? "bg-[#D5DAFF] border-none " : "bg-white border-none"}`}
                    >
                        <CustomText variant="labelL" className="text-[#000000] font-bold">
                            Asambleístas
                        </CustomText>
                    </CustomButton>
                    <CustomButton
                        onClick={() => setActiveTab("Sobre IntuApp")}
                        className={`flex-1 py-3 ${activeTab === "Sobre IntuApp" ? "bg-[#D5DAFF] border-none " : "bg-white border-none"}`}
                    >
                        <CustomText variant="labelL" className="text-[#000000] font-bold">
                            Sobre IntuApp
                        </CustomText>
                    </CustomButton>
                </div>

                {/* ---------------- TAB CONTENT ---------------- */}
                {activeTab === "Asambleistas" ? (

                    /* CONTENIDO TAB ASAMBLEISTAS */
                    <div className="bg-white rounded-[32px] p-6 mx-8 md:p-10 shadow-sm border border-gray-100 animate-in fade-in duration-500 pb-8">
                        <CustomText variant="TitleM" className="font-bold text-[#0E3C42] mb-6">Asistencia</CustomText>

                        {/* ALERTA INFORMATIVA (Solo visual) */}
                        <div className="bg-[#FFF4E5] border border-orange-200 rounded-2xl p-4 md:p-5 flex gap-4 items-start mb-6">
                            <AlertTriangle className="text-[#F98A56] shrink-0 mt-0.5" size={24} />
                            <div className="flex flex-col gap-1">
                                <CustomText variant="bodyS" className="font-black text-[#8B4513]">Importante</CustomText>
                                <CustomText variant="labelL" className="text-[#8B4513]/80 leading-relaxed">
                                    La responsabilidad de definir a qué asambleístas se les restringe el voto recae exclusivamente en el Operador Logístico o en la administración o funcionario de la entidad. IntuApp no valida las causales de restricción ni asume responsabilidad legal por el uso de esta función.
                                </CustomText>
                            </div>
                        </div>

                        {/* TABLA DE ASISTENCIA (Usando tu componente y pasándole masterList) */}
                        <AttendanceTable
                            assembly={assemblyData}
                            registrations={registrations?.registrations}
                            masterList={masterList}

                            // 👇 ESTO ES CLAVE PARA QUE FUNCIONE LA COLUMNA
                            blockedProperties={registrations?.blockedProperties || []}

                            mode="funcionario"
                            showActions={false}
                        />
                    </div>

                ) : (

                    /* CONTENIDO TAB SOBRE INTUAPP */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10 mx-8">
                        {/* HERO GRADIENT CARD */}
                        <div className="relative overflow-hidden rounded-[32px] bg- p-8 sm:p-10 shadow-soft">
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <img src="/logos/logo/component.png" alt="decoration" />
                                <CustomText variant="bodyX" className="text-[#0E3C42] font-medium">
                                    Lo complejo hecho simple
                                </CustomText>
                            </div>

                            <div className="absolute -top-20 -left-40 w-[500px] h-[500px] bg-[#94A2FF] opacity-80 blur-[90px] rounded-full pointer-events-none" />

                            <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-[#ABE7E5] opacity-80 blur-[90px] rounded-full pointer-events-none" />

                            <div className="absolute -top-10 right-0 w-[500px] h-[500px] bg-[#ABE7E5] opacity-80 blur-[90px] rounded-full pointer-events-none" />

                            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#94A2FF] opacity-80 blur-[100px] rounded-full pointer-events-none" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10 mt-12 max-w-5xl mx-auto">
                                <div className="bg-white rounded-[24px] p-6 shadow-lg text-[#0E3C42]">
                                    <CustomText variant="bodyL" className="text-[#0E3C42] font-black mb-2">
                                        Nuestra Misión
                                    </CustomText>
                                    <CustomText variant="bodyS" className="text-gray-600 font-medium leading-relaxed">
                                        Creamos herramientas funcionales con un enfoque intuitivo para simplificar lo complejo. Nuestro objetivo es hacer que la gestión de asambleas sea accesible y eficiente para todos.
                                    </CustomText>
                                </div>

                                <div className="bg-white rounded-[24px] p-6 shadow-lg text-[#0E3C42]">
                                    <CustomText variant="bodyL" className="text-[#0E3C42] font-black mb-2">
                                        Experiencia
                                    </CustomText>
                                    <CustomText variant="bodyS" className="text-gray-600 font-medium mb-1">
                                        Más de 10 años de experiencia en la gestión de asambleas.
                                    </CustomText>
                                    <CustomText variant="bodyS" className="text-black font-black space-y-1">
                                        <p>• 500+ asambleas exitosas</p>
                                        <p>• Miles de Asambleístas satisfechos</p>
                                    </CustomText>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10 mt-12 max-w-5xl mx-auto">
                                <div className="bg-white rounded-[24px] p-6 shadow-lg text-[#0E3C42]">
                                    <CustomText variant="bodyL" className="text-[#0E3C42] font-black mb-2">
                                        ¿Qué hacemos?
                                    </CustomText>
                                    <CustomText variant="bodyS" className="text-gray-600 font-medium leading-relaxed mb-1">
                                        Somos una herramienta que facilita y dinamiza el proceso de registros y votaciones en las asambleas.
                                    </CustomText>
                                </div>

                                <div className="bg-white rounded-[24px] p-6 shadow-lg text-[#0E3C42]">
                                    <CustomText variant="bodyL" className="text-[#0E3C42] font-black mb-2">
                                        Nuestro Rol
                                    </CustomText>
                                    <CustomText variant="bodyS" className="text-gray-600 font-medium leading-relaxed mb-1">
                                        Somos la herramienta tecnológica que facilita el proceso, no el operador logístico que realiza tu asamblea.
                                    </CustomText>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#EEF0FF] border border-[#94A2FF] rounded-[16px] p-8 relative overflow-hidden flex gap-2 items-start">

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <CustomIcon
                                        path={ICON_PATHS.info}
                                        size={20}
                                    />
                                    <CustomText variant="bodyS" className=" font-bold">Importante</CustomText>

                                </div>
                                <ul className=" text-base list-disc pl-8">
                                    <li>Intuapp es una herramienta tecnológica de apoyo, no ejerce control sobre la asamblea.</li>
                                    <li>No determinamos la validez de las decisiones.</li>
                                    <li>No se aplica regla de tres ni un nuevo 100% sobre los presentes.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </main>            

        </div>
    );
};

export default FuncionarioPage;