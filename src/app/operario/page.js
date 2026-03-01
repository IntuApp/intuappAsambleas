"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, QrCode } from "lucide-react";
import WelcomeSection from "@/components/basics/WelcomeSection";
import StatCard from "@/components/basics/StatCard";
import SectionCard from "@/components/basics/SectionCard";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import ListItem from "@/components/assemblies/ListItem"; // Asegúrate de que la ruta sea correcta
import HelpFullBanner from "@/components/basics/HelpFullBanner"; // Asegúrate de que la ruta sea correcta
import QrModal from "@/components/modal/QrModal";
import { ICON_PATHS } from "@/constans/iconPaths";
import { useAuth } from "@/context/AuthContext";

// Importamos los métodos de Firebase que ya tenías
import { listenToOperatorById } from "@/lib/user";
import { listenToAssemblies, listenToAssemblyStatuses } from "@/lib/assembly";

const formatShortDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
};

const OperatorPage = () => {
    const router = useRouter();
    const { user } = useAuth(); // Asumimos que user tiene el uid (ej: user.uid o user.id)

    const [operatorData, setOperatorData] = useState(null);
    const [assemblies, setAssemblies] = useState([]);
    const [assemblyStatuses, setAssemblyStatuses] = useState({});

    useEffect(() => {
        // Si no hay usuario logueado, no hacemos nada
        if (!user?.uid) return;

        // 1. Escuchar los datos de este operador específico (incluye sus entidades pobladas)
        const unsubscribeOperator = listenToOperatorById(user.uid, (data) => {
            setOperatorData(data);
        });

        // 2. Escuchar TODAS las asambleas
        const unsubscribeAssemblies = listenToAssemblies((data) => {
            setAssemblies(data);
        });

        // 3. Escuchar los estados para mapearlos correctamente
        const unsubscribeStatuses = listenToAssemblyStatuses((data) => {
            setAssemblyStatuses(data);
        });

        return () => {
            unsubscribeOperator();
            unsubscribeAssemblies();
            unsubscribeStatuses();
        };
    }, [user?.uid]);

    // --- LÓGICA DE FILTRADO Y CRUCE DE DATOS ---

    // Extraemos las entidades pobladas del operador
    const entities = operatorData?.entitiesData || [];
    const entityIds = operatorData?.entities || [];

    // Filtramos solo las asambleas que pertenecen a las entidades de ESTE operador
    const operatorAssemblies = assemblies.filter(asm => entityIds.includes(asm.entityId));

    // Separamos las asambleas por estado usando el diccionario o el statusID directo (1: Creada/Próxima, 2: En Vivo)
    const scheduledAssemblies = operatorAssemblies.filter(asm => asm.statusID === "1" || assemblyStatuses[asm.statusID] === "CREATED");
    const liveAssemblies = operatorAssemblies.filter(asm => asm.statusID === "2" || assemblyStatuses[asm.statusID] === "LIVE" || asm.status === "started");

    const [selectedAssembly, setSelectedAssembly] = useState(null);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    // Función para abrir modal de QR (Mantenemos la estructura de tu código)
    const openQrModal = (assembly) => {
        setSelectedAssembly(assembly);
        setIsQrModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-8">
            <WelcomeSection userName={user?.name || user?.firstName} />

            {/* --- TARJETAS DE ESTADÍSTICAS --- */}
            <div className="flex flex-start justify-start flex-wrap gap-6 w-full">
                {/* Total Entidades del Operador */}
                <StatCard
                    iconPath={ICON_PATHS.groupPeople}
                    label="Total Entidades"
                    value={entities.length}
                    classIcon="text-[#6A7EFF] w-[40px] h-[40px]"
                    iconBgColor="bg-[#EEF0FF] w-[56px] h-[56px]"
                    className="w-full h-full max-w-[360px] max-h-[104px] rounded-[16px] border-[#F3F6F9] p-6"
                />

                {/* Total Asambleas Agendadas (Próximas) de este Operador */}
                <StatCard
                    iconPath={ICON_PATHS.calendarTime}
                    label="Asambleas Agendadas"
                    value={scheduledAssemblies.length}
                    classIcon="text-[#6A7EFF] w-[40px] h-[40px]"
                    iconBgColor="bg-[#EEF0FF] w-[56px] h-[56px]"
                    className="w-full h-full max-w-[360px] max-h-[104px] rounded-[16px] border-[#F3F6F9] p-6"
                />
            </div>

            <section className="grid grid-cols-2  gap-5 justify-between">

                {/* --- COLUMNA IZQUIERDA: Entidades del Operador --- */}
                <div className="space-y-8 max-w-[552px] w-full">
                    <SectionCard
                        title="Entidades"
                        className="border-[#F3F6F9] rounded-[24px] p-6 gap-6"
                        actionLabel={"Crear Entidad"}
                        onAction={() => router.push("/operario/crear-entidad")}
                        viewAllHref="/operario/entidades"
                        viewAllText="Ver todas las Entidades"
                        classButton="flex items-center gap-2 font-bold py-2 px-3 text-[14px]"
                        iconButton={<Plus size={16} />}
                        contentClassName="max-w-[504px] max-h-[400px] overflow-y-auto w-full pb-2 no-scrollbar"
                    >
                        <div className="flex flex-col gap-3 mt-4">
                            {entities.map((entity) => (
                                <ListItem
                                    key={entity.id}
                                    entity={entity}
                                    title={entity.name}
                                    subtitle={`${entity.totalRegistries || 0} registros`} // Ajusta según tu DB
                                    showNextAssembly={true}
                                    onClick={() => router.push(`/operario/${entity.id}`)}
                                    classContainer="max-w-[504px] w-full h-[72px] rounded-2xl shadow-sm border border-[#F3F6F9] hover:shadow-md transition-shadow py-3 px-4 gap-4 cursor-pointer"
                                />
                            ))}
                            {entities.length === 0 && (
                                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    No tienes entidades asignadas.
                                </p>
                            )}
                        </div>
                    </SectionCard>
                </div>

                {/* --- COLUMNA DERECHA: Asambleas --- */}
                <div className="space-y-8 w-full">

                    {/* 1. Asambleas en curso (En vivo) */}
                    <SectionCard
                        title="Asambleas en curso"
                        className="border-[#F3F6F9] rounded-[24px] p-6 gap-6 max-h-[264px]"
                        contentClassName="max-w-[502px] max-h-[160px] overflow-y-auto w-full pb-2 no-scrollbar"
                    >
                        <div className="flex flex-col gap-3 mt-4">
                            {liveAssemblies.length > 0 ? (
                                liveAssemblies.map((assembly) => {
                                    // Buscamos el nombre de la entidad en el array de entidades pobladas
                                    const entityName = entities.find(e => e.id === assembly.entityId)?.name || "Entidad";
                                    return (
                                        <ListItem
                                            key={assembly.id}
                                            title={`${entityName} · ${assembly.name}`}
                                            subtitle={`Inició a las ${assembly.hour || "00:00"}`}
                                            classContainer="max-w-[502px] w-full h-[72px] rounded-2xl shadow-sm border border-[#F3F6F9] hover:shadow-md transition-shadow py-3 px-4 gap-4 cursor-pointer"
                                            status={{
                                                text: "En vivo",
                                                color: "bg-red-100 text-red-600",
                                                dot: true,
                                            }}
                                            onClick={() => router.push(`/operario/${assembly.entityId}/${assembly.id}`)}
                                        />
                                    );
                                })
                            ) : (
                                <div className="flex items-center justify-center border border-[#94A2FF] bg-[#EEF0FF] rounded-[16px] p-4 h-[72px]">
                                    <CustomText variant="labelL" className="text-[#1F1F23] font-bold">
                                        No hay asambleas en curso.
                                    </CustomText>
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    {/* 2. Próximas Asambleas (Agendadas) */}
                    <SectionCard
                        title="Próximas Asambleas"
                        isOperator
                        className="border-[#F3F6F9] rounded-[24px] p-6 gap-6"
                        viewAllHref="/operario/asambleas"
                        viewAllText="Ver todas las asambleas"
                        contentClassName="max-w-[502px] max-h-[324px] overflow-y-auto w-full pb-2 no-scrollbar"
                    >
                        <div className="flex flex-col gap-4 mt-4">
                            {scheduledAssemblies.length > 0 ? (
                                scheduledAssemblies.map((assembly) => {
                                    const entityName = entities.find(e => e.id === assembly.entityId)?.name || "Entidad";
                                    return (
                                        <div
                                            key={assembly.id}
                                            className="max-w-[504px] w-full h-[152px] rounded-2xl shadow-sm border border-[#F3F6F9] bg-white p-4 flex flex-col justify-between"
                                        >
                                            <ListItem
                                                title={entityName}
                                                subtitle={`${assembly.hour || "00:00"} · ${assembly.type || "Presencial"}`}
                                                status={{
                                                    text: assembly.date ? formatShortDate(assembly.date) : "Fecha pendiente",
                                                    color: "bg-[#B8EAF0] text-[#0E3C42]",
                                                    dot: false,
                                                }}
                                                isAssamblea
                                                classContainer="py-0 gap-4 border-none shadow-none"
                                            />

                                            <div className="flex gap-2 w-full mt-2">
                                                <CustomButton
                                                    variant="secondary"
                                                    onClick={() => openQrModal(assembly)}
                                                    className="px-4 py-2 border-[2px] border-[#0E3C42] rounded-sm hover:bg-gray-50 !text-[#000000] transition-colors flex items-center justify-center"
                                                >
                                                    <QrCode size={20} />
                                                </CustomButton>

                                                <CustomButton
                                                    variant="primary"
                                                    size="M"
                                                    className="flex-1 flex items-center gap-2 justify-center py-3 px-4 !text-[#000000] font-bold rounded-full"
                                                    onClick={() => router.push(`/operario/${assembly.entityId}/${assembly.id}`)}
                                                >
                                                    <CustomIcon path={ICON_PATHS.settings} size={16} />
                                                    <CustomText variant="labelM" className="font-bold">
                                                        Gestionar
                                                    </CustomText>
                                                </CustomButton>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    No hay próximas asambleas.
                                </p>
                            )}
                        </div>
                    </SectionCard>

                </div>
            </section>

            {/* Banner decorativo */}
            <HelpFullBanner />

            {/* Modal de QR */}
            <QrModal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                assembly={selectedAssembly}
            />

            <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
      `}</style>
        </div>
    );
};

export default OperatorPage;