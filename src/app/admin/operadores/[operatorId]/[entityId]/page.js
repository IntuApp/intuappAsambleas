"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// Importamos los métodos (ajusta las rutas a tu proyecto real)
import { listenToEntityById, listenToEntityAssemblies, getAssemblyRegistriesArray } from "@/lib/entity";
import { deleteEntity, updateEntityBasicData, updateEntityDatabase } from "@/lib/entityActions"; // updateEntityBasicData lo hicimos antes
import { getEntityTypes } from "@/lib/masterData";

import Loader from "@/components/basics/Loader";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";

import EntityDatabaseManager from "@/components/entities/EntityDatabaseManager";
import EntityAssembliesSection from "@/components/entities/EntityAssembliesSection";
import EntityEditModal from "@/components/entities/EntityEditModal";

import ConfirmationModal from "@/components/modal/ConfirmationModal";
import SuccessModal from "@/components/modal/SuccessModal";

import { ICON_PATHS } from "@/constans/iconPaths";
import { getIconPath, getTypeName } from "@/lib/utils";
import { toast } from "react-toastify";

const EntityDetailPage = () => {
    const params = useParams();
    const entityId = params?.entityId || params?.id;
    const operatorId = params?.operatorId;

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [entityData, setEntityData] = useState(null);
    const [assemblies, setAssemblies] = useState([]);
    const [registries, setRegistries] = useState([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [entityTypes, setEntityTypes] = useState([]);

    // Modales eliminar
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // 🔥 SOLUCIÓN: ESTADO DEL FORMULARIO DE EDICIÓN
    const [formData, setFormData] = useState({
        name: "",
        nit: "",
        type: "",
        city: "",
        address: "",
        adminName: "",
        adminEmail: "",
        adminPhone: "",
    });
    // Estado de carga específico para el botón de guardar del modal
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Escuchador de la Entidad
    useEffect(() => {
        if (!entityId) return;

        const unsubscribeEntity = listenToEntityById(entityId, async (data) => {
            if (data) {
                setEntityData(data);

                // 🔥 SOLUCIÓN: Llenamos el formData con los datos que llegan de Firebase
                // Así cuando abras el modal, ya tiene la información actual
                setFormData({
                    name: data.name || "",
                    nit: data.nit || "",
                    type: data.typeID || "", // Usamos typeID que es lo que guardas
                    city: data.city || "",
                    address: data.address || "",
                    adminName: data.adminEntity?.name || "",
                    adminEmail: data.adminEntity?.email || "",
                    adminPhone: data.adminEntity?.phone || "",
                });

                if (data.assemblyRegistriesListId) {
                    const regs = await getAssemblyRegistriesArray(data.assemblyRegistriesListId);
                    setRegistries(regs);
                }
            } else {
                toast.error("La entidad no existe o fue eliminada.");
                router.back();
            }
            setLoading(false);
        });

        const unsubscribeAssemblies = listenToEntityAssemblies(entityId, (data) => {
            setAssemblies(data);
        });

        getEntityTypes().then((res) => res.success && setEntityTypes(res.data));

        return () => {
            unsubscribeEntity();
            unsubscribeAssemblies();
        };
    }, [entityId, router]);


    // 🔥 SOLUCIÓN: FUNCIÓN PARA GUARDAR LA EDICIÓN
    const handleSaveEntity = async () => {
        // Validaciones básicas
        if (!formData.name || !formData.type) {
            toast.error("El nombre y el tipo de entidad son obligatorios.");
            return;
        }

        setIsSavingEdit(true);
        try {
            // Llamamos a la Server Action que creamos en el paso anterior
            const res = await updateEntityBasicData(entityId, formData);
            if (res.success) {
                toast.success("Entidad actualizada correctamente");
                setIsEditModalOpen(false); // Cerramos el modal
                // No necesitamos recargar porque el onSnapshot de Firebase actualizará todo instantáneamente
            }
        } catch (error) {
            toast.error(error.message || "Error al actualizar la entidad");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleUpdateDatabase = async ({ newData, newHeaders, newAliases }) => {
        try {
            // 🔥 LIMPIEZA DE DATOS: Esto convierte los datos en objetos planos puros
            // eliminando métodos de clase o prototipos que Next.js no puede serializar.
            const cleanData = JSON.parse(JSON.stringify(newData));
            const cleanHeaders = JSON.parse(JSON.stringify(newHeaders));
            const cleanAliases = JSON.parse(JSON.stringify(newAliases));

            // Llamamos a tu Server Action con los argumentos individuales que espera
            const res = await updateEntityDatabase(
                entityId,
                cleanData,
                cleanAliases,
                cleanHeaders
            );

            if (res.success) {
                return true;
            }
        } catch (error) {
            console.error("Error en handleUpdateDatabase:", error);
            // Lanzamos el error para que el componente hijo lo capture y muestre el toast
            throw new Error(error.message || "Error al procesar los datos en el servidor");
        }
    };

    const handleConfirmDeleteEntity = async () => {
        if (!entityData || !entityId) {
            toast.error("No se pudo obtener la información de la entidad para eliminar.");
            return;
        }

        setIsDeleting(true);
        try {
            const res = await deleteEntity({
                id: entityId,
                assemblyRegistriesListId: entityData.assemblyRegistriesListId
            });

            if (res.success) {
                setShowDeleteModal(false);
                setShowSuccessModal(true);
            } else {
                toast.error("Error al eliminar: " + res.error);
            }
        } catch (error) {
            console.error("Error en handleConfirmDeleteEntity:", error);
            toast.error("Ocurrió un error inesperado.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader /></div>;
    if (!entityData) return null;

    return (
        <>
            <div className="flex flex-col w-full gap-8">

                {/* MODAL DE EDICIÓN */}
                <EntityEditModal
                    isOpen={isEditModalOpen}
                    entityForm={formData}
                    setEntityForm={setFormData}
                    entityTypes={entityTypes}
                    loading={isSavingEdit} // Le pasamos el estado de carga del guardado
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleSaveEntity} // Le pasamos la función de guardado
                />

                {/* HEADER DE LA ENTIDAD */}
                {!isEditModalOpen && (
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <CustomText variant="TitleL" className="font-bold text-[#0E3C42]">
                                {entityData.name}
                            </CustomText>

                            <CustomButton
                                variant="primary"
                                onClick={() => setShowDeleteModal(true)}
                                className="px-5 py-3 flex items-center gap-2"
                            >
                                <CustomIcon path={ICON_PATHS.delete} size={20} />
                                <CustomText variant="bodyM" className="font-bold">
                                    Eliminar Entidad
                                </CustomText>
                            </CustomButton>
                        </div>

                        {/* INFO GENERAL */}
                        <div className="bg-white rounded-[24px] border border-[#F3F6F9] shadow-sm p-8">
                            <div className="flex justify-between mb-6">
                                <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
                                    Información General
                                </CustomText>
                                <CustomButton
                                    variant="primary"
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2"
                                >
                                    <CustomIcon path={ICON_PATHS.pencil} size={16} />
                                    <CustomText variant="labelL" className="font-bold">
                                        Editar información
                                    </CustomText>
                                </CustomButton>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                <Info label="NIT" value={entityData.nit} />
                                <Info
                                    label="Tipo entidad"
                                    value={getTypeName(entityData.typeID)}
                                    icon={<CustomIcon path={getIconPath(entityData.typeID)} size={14} />}
                                />
                                <Info label="Asambleístas" value={registries.length} />
                                <Info label="Ciudad" value={entityData.city} />
                                <Info label="Dirección" value={entityData.address} />
                                <Info label="Admin" value={entityData.adminEntity?.name} />
                                <Info label="Email" value={entityData.adminEntity?.email} />
                                <Info label="Teléfono" value={entityData.adminEntity?.phone} />
                            </div>
                        </div>

                        {/* SECCIÓN DE ASAMBLEAS */}
                        <EntityAssembliesSection
                            entityId={entityId}
                            assemblies={assemblies}
                            createAssemblyRoute={() => router.push(`/admin/operadores/${operatorId}/${entityId}/crear-asamblea`)}
                            viewAssemblyRoute={(assemblyId) => router.push(`/admin/operadores/${operatorId}/${entityId}/${assemblyId}`)}
                        />

                        {/* SECCIÓN DE BASE DE DATOS (EL EXCEL) */}
                        <EntityDatabaseManager
                            entityData={entityData}
                            registries={registries}
                            onUpdateDatabase={handleUpdateDatabase}
                        />
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDeleteEntity}
                title="Eliminar entidad"
                message="Esta acción eliminará permanentemente la entidad y todas sus asambleas."
                confirmText="Eliminar"
                isLoading={isDeleting}
            />

            <SuccessModal
                isOpen={showSuccessModal}
                title="Entidad eliminada"
                message="La entidad fue eliminada correctamente."
                buttonText="Volver a operadores"
                onConfirm={() => router.push(`/admin/operadores/${operatorId}`)}
            />
        </>
    );
};

const Info = ({ label, value, icon }) => (
    <div className="flex flex-col gap-1">
        <CustomText variant="labelM" className="text-gray-500">
            {label}
        </CustomText>
        <div className="flex items-center gap-2 font-bold text-[#0E3C42]">
            {icon}
            {value || "-"}
        </div>
    </div>
);

export default EntityDetailPage;