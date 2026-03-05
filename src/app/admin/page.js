"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight } from "lucide-react";
import WelcomeSection from "@/components/basics/WelcomeSection";
import StatCard from "@/components/basics/StatCard";
import SectionCard from "@/components/basics/SectionCard";
import { ICON_PATHS } from "@/constans/iconPaths";
import { useAuth } from "@/context/AuthContext";
import { listenToOperators } from "@/lib/user";
import { listenToAssemblies, listenToAssemblyStatuses } from "@/lib/assembly";
import CustomText from "@/components/basics/CustomText";
import CustomIcon from "@/components/basics/CustomIcon";

const formatShortDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
};

const AdminPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const firstName = user?.name ? user.name.split(" ")[0] : "Administrador";

    const [operators, setOperators] = useState([]);
    const [assemblies, setAssemblies] = useState([]);
    const [assemblyStatuses, setAssemblyStatuses] = useState({});

    useEffect(() => {
        const unsubscribeOperators = listenToOperators((data) => setOperators(data));
        const unsubscribeAssemblies = listenToAssemblies((data) => setAssemblies(data));
        const unsubscribeStatuses = listenToAssemblyStatuses((data) => setAssemblyStatuses(data));

        return () => {
            unsubscribeOperators();
            unsubscribeAssemblies();
            unsubscribeStatuses();
        };
    }, []);

    // Cálculo dinámico para las tarjetas superiores
    const totalEntities = operators.reduce((acc, op) => acc + (op.entities?.length || 0), 0);
    const scheduledAssembliesCount = assemblies.filter(asm => assemblyStatuses[asm.statusID] === "CREATED" || asm.statusID === "1").length;

    return (
        <div className="flex flex-col gap-8">
            <WelcomeSection userName={user?.name} />

            <div className="flex flex-start justify-between flex-wrap gap-6 w-full">
                <StatCard
                    iconPath={ICON_PATHS.groupPeople}
                    label="Operadores Logísticos"
                    value={operators.length}
                    classIcon="text-[#6A7EFF] w-[40px] h-[40px]"
                    iconBgColor="bg-[#EEF0FF] w-[56px] h-[56px]"
                    className="w-full h-full max-w-[360px] max-h-[104px] rounded-[16px] border-[#F3F6F9] p-6"
                />
                <StatCard
                    iconPath={ICON_PATHS.conjunto}
                    label="Entidades en total"
                    value={totalEntities} // Valor dinámico
                    classIcon="text-[#6A7EFF] w-[40px] h-[40px]"
                    iconBgColor="bg-[#EEF0FF] w-[56px] h-[56px]"
                    className="w-full h-full max-w-[360px] max-h-[104px] rounded-[16px] border-[#F3F6F9] p-6"
                />
                <StatCard
                    iconPath={ICON_PATHS.calendarTime}
                    label="Asambleas agendadas"
                    value={scheduledAssembliesCount} // Valor dinámico
                    classIcon="text-[#6A7EFF] w-[40px] h-[40px]"
                    iconBgColor="bg-[#EEF0FF] w-[56px] h-[56px]"
                    className="w-full h-full max-w-[360px] max-h-[104px] rounded-[16px] border-[#F3F6F9] p-6"
                />
            </div>

            <section className="w-full h-full max-h-[789px] flex flex-wrap gap-5 justify-between">

                {/* COLUMNA IZQUIERDA: Operadores Logísticos */}
                <div className="space-y-8 max-w-[48%] w-full max-h-[424px]">
                    <SectionCard
                        title="Operadores Logísticos"
                        viewAllHref="/admin/operadores"
                        viewAllText="Ver todos los Operadores"
                        className="border-[#F3F6F9] rounded-[24px] p-6 gap-6"
                        actionLabel="Crear Operador"
                        onAction={() => router.push("/admin/operadores/crear")}
                        classButton="flex items-center gap-2 font-bold py-2 px-3 text-[14px]"
                        iconButton={<Plus size={16} />}
                        contentClassName="max-h-[204px] w-full pb-2"
                    >
                        <div className="flex flex-col gap-3 mt-4">
                            {operators.slice(0, 4).map((operator) => {
                                const opAssemblies = assemblies.filter(asm => operator.entities?.includes(asm.entityId));

                                const createdAssemblies = opAssemblies
                                    .filter(asm => asm.statusID === "1" || assemblyStatuses[asm.statusID] === "CREATED")
                                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                                const nextAssembly = createdAssemblies[0];
                                const entitiesCount = operator.entities?.length || 0;
                                const operatorName = operator.name || operator.representative?.name || "Operador Sin Nombre";

                                return (
                                    <div
                                        key={operator.id}
                                        onClick={() => router.push(`/admin/operadores/${operator.id}`)} // <-- Redirección añadida
                                        className="w-full flex justify-between items-center p-4 border border-[#F3F6F9] rounded-2xl shadow-soft hover:shadow-sm cursor-pointer transition-all bg-white"
                                    >
                                        <div className="flex flex-col">
                                            <CustomText variant="labelL" className="text-[#000000] font-bold truncate">
                                                {operatorName}
                                            </CustomText>
                                            <CustomText variant="labelM" className="text-[#3D3D44] font-medium truncate">
                                                {entitiesCount} Entidades · {nextAssembly ? `Próxima asamblea: ${formatShortDate(nextAssembly.date)}` : "Sin asambleas programadas"}
                                            </CustomText>
                                        </div>
                                        <ChevronRight className="text-[#0E3C42]" size={20} />
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>
                </div>

                {/* COLUMNA DERECHA: Asambleas */}
                <div className="space-y-8 max-w-[48%] w-full max-h-[424px]">
                    <SectionCard
                        title="Asambleas"
                        viewAllHref="/admin/asambleas"
                        viewAllText="Ver todas las Asambleas"
                        className="border-[#F3F6F9] rounded-[24px] p-6 gap-6"
                        contentClassName="w-full pb-2"
                    >
                        <div className="flex flex-col gap-3 mt-4">
                            {assemblies.slice(0, 4).map((assembly) => {
                                const ownerOp = operators.find(op => op.entities?.includes(assembly.entityId));
                                const operatorName = ownerOp?.name || ownerOp?.representative?.name || "Operador General";

                                const entity = ownerOp?.entitiesData?.find(e => e.id === assembly.entityId);
                                const entityName = entity?.name || assembly.name;

                                const isLive = assembly.statusID === "3" || assemblyStatuses[assembly.statusID] === "LIVE";
                                console.log("ownerOp", ownerOp?.id);


                                return (
                                    <div key={assembly.id} onClick={() => router.push(`/admin/operadores/${ownerOp?.id}/${assembly.entityId}/${assembly.id}`)} className="flex justify-between items-center p-4 border border-gray-100 rounded-[16px] shadow-soft hover:shadow-sm cursor-pointer transition-all bg-white">
                                        <div className="flex flex-col max-w-[65%]">
                                            <CustomText variant="labelL" className="text-[#0E3C42] font-bold truncate">
                                                {operatorName}
                                            </CustomText>
                                            <CustomText variant="labelM" className="text-[#333333] font-medium truncate">
                                                {entityName} · {isLive ? "Inició hace 30 minutos" : `${assembly.hour || "Sin hora"} · ${assembly.type || "Presencial"}`}
                                            </CustomText>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {isLive ? (
                                                <div className="bg-[#FACCCD] px-2 py-1 rounded-full flex items-center gap-1 border border-[#F7AEB0]">
                                                    <CustomIcon path={ICON_PATHS.record} size={16} color="#930002" />
                                                    <CustomText variant="labelM" className="text-[#930002] font-medium">En vivo</CustomText>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 bg-[#FFEDDD] px-2 py-1 rounded-full">
                                                    <CustomText variant="labelM" className="text-[#C53F00] font-medium">
                                                        {formatShortDate(assembly.date)}
                                                    </CustomText>
                                                </div>
                                            )}
                                            <ChevronRight className="text-[#0E3C42]" size={20} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>
                </div>

            </section>
        </div>
    );
};

export default AdminPage;