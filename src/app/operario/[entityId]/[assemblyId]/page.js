"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// Métodos de lógica
import { listenToAssemblyLive, getEntityMasterList } from "@/lib/assembly";
import { updateAssemblyStatus, toggleRegistration, updateLivePropertyBlock, deleteAssemblyRegistry } from "@/lib/assemblyActions";
import { listenToEntityById } from "@/lib/entity";

// Componentes
import AssemblyLiveManager from "@/components/assemblies/AssemblyLiveManager";
import Loader from "@/components/basics/Loader";
import LiveVoteRestrictionManager from "@/components/assemblies/LiveVoteRestrictionManager";
import AttendanceTable from "@/components/assemblies/AttendanceTable";
import CustomButton from "@/components/basics/CustomButton";
import QuestionsManager from "@/components/assemblies/QuestionsManager";
import CustomText from "@/components/basics/CustomText";

const OperatorAssemblyPage = () => {
    // Para el operador la ruta es /operario/[entityId]/[assemblyId]
    const { entityId, assemblyId } = useParams();
    const router = useRouter();

    // Estados de datos
    const [loading, setLoading] = useState(true);
    const [assemblyData, setAssemblyData] = useState(null);
    const [entityData, setEntityData] = useState(null);
    const [registrations, setRegistrations] = useState(null);
    const [masterList, setMasterList] = useState({});
    const [mainTab, setMainTab] = useState("Asambleistas");

    useEffect(() => {
        if (!assemblyId || !entityId) return;

        // 1. Escuchar la Asamblea y los Registros (Check-ins/Bloqueos) en tiempo real
        const unsubscribeLive = listenToAssemblyLive(assemblyId, async (data) => {
            if (!data) {
                router.back();
                return;
            }

            setAssemblyData(data.assembly);
            setRegistrations(data.registrations);

            // 2. Una vez tenemos la asamblea, cargamos la lista maestra si no la tenemos
            if (data.assembly.entityId && Object.keys(masterList).length === 0) {
                const unsubscribeEntity = listenToEntityById(entityId, async (ent) => {
                    setEntityData(ent);
                    if (ent.assemblyRegistriesListId) {
                        const master = await getEntityMasterList(ent.assemblyRegistriesListId);
                        setMasterList(master);
                    }
                });
                return () => unsubscribeEntity();
            }
            setLoading(false);
        });

        return () => unsubscribeLive();
    }, [assemblyId, entityId, router]);

    // HANDLERS PARA ACCIONES DE SERVIDOR
    const handleUpdateStatus = async (newStatus) => {
        try {
            await updateAssemblyStatus(assemblyId, newStatus);
            const statusNames = { "2": "iniciada", "3": "finalizada" };
        } catch (error) {
        }
    };

    const handleToggleRegister = async (isOpen) => {
        try {
            await toggleRegistration(assemblyId, isOpen);
        } catch (error) {
        }
    };

    const handleToggleBlock = async (propertyId, isBlocking) => {
        // 1. Verificación preventiva
        if (!registrations?.id) {
            return;
        }

        if (!propertyId) return;

        try {
            const result = await updateLivePropertyBlock(registrations.id, propertyId, isBlocking);

            if (result.success) {
            }
        } catch (error) {
        }
    };

    const handleTableAction = async (item, actionType) => {
        if (actionType === "delete") {
            const confirmDelete = window.confirm(
                `¿Estás seguro de liberar la propiedad ${item.propiedad}? Pasará a "Pendientes" y otro usuario podrá registrarla.`
            );

            if (!confirmDelete) return;

            try {
                // Evaluamos si es la propiedad principal basándonos en el flag
                const isMainProperty = item.addedByUser === false;

                await deleteAssemblyRegistry(
                    assemblyData.registrationRecordId, 
                    item.mainDocument,                
                    item.id,                          
                    isMainProperty                    
                );

                if (isMainProperty) {
                } else {
                }

            } catch (error) {
                console.error("Error al liberar propiedad:", error);
            }
        } else if (actionType === "restore") {
        }
    };

    if (!assemblyData || !entityData) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full py-6 lg:px-0 gap-6">
            <AssemblyLiveManager
                assembly={assemblyData}
                entity={entityData}
                registrations={registrations}
                masterList={masterList}
                onUpdateStatus={handleUpdateStatus}
                onToggleRegister={handleToggleRegister}
            />
            
            <div className="w-full bg-[#FFFFFF] rounded-full p-2 border border-[#F3F6F9] flex flex-row gap-1 shadow-sm">
                <CustomButton
                    onClick={() => setMainTab("Asambleistas")}
                    className={`flex-1 py-3 transition-colors ${mainTab === "Asambleistas" ? "bg-[#D5DAFF] border-none" : "bg-white border-none hover:bg-gray-50"}`}
                >
                    <CustomText variant="labelL" className="text-[#000000] font-bold">
                        Gestionar asambleístas
                    </CustomText>
                </CustomButton>
                <CustomButton
                    onClick={() => setMainTab("Votaciones")}
                    className={`flex-1 py-3 transition-colors ${mainTab === "Votaciones" ? "bg-[#D5DAFF] border-none" : "bg-white border-none hover:bg-gray-50"}`}
                >
                    <CustomText variant="labelL" className="text-[#000000] font-bold">
                        Gestionar votaciones
                    </CustomText>
                </CustomButton>
            </div>

            {mainTab === "Asambleistas" ? (
                <AttendanceTable
                    assembly={assemblyData}
                    registrations={registrations?.registrations}
                    masterList={masterList}
                    onAction={handleTableAction}
                />
            ) : (
                <div className="w-full animate-in fade-in duration-300 pt-4">
                    <QuestionsManager assemblyId={assemblyId} assemblyData={assemblyData} />
                </div>
            )}

            {mainTab === "Asambleistas" && (
                <LiveVoteRestrictionManager
                    registries={Object.entries(masterList).map(([id, data]) => ({
                        ...data,
                        id: id 
                    }))}
                    blockedProperties={registrations?.blockedProperties || []}
                    onToggleBlock={handleToggleBlock}
                    isFinished={assemblyData.statusID === "3"}
                    entityHeaders={entityData.headers || []}
                    columnAliases={entityData.columnAliases || {}}
                />
            )}
        </div>
    );
};

export default OperatorAssemblyPage;