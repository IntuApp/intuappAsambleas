"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import EntitiesList from "@/components/entities/EntitiesList";
import { listenToOperatorById } from "@/lib/user";
import { deleteOperator } from "@/lib/userActions";

// Solo necesitamos el ConfirmationModal ahora
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import Loader from "@/components/basics/Loader";

const Info = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <CustomText variant="labelM" className="text-gray-500">
            {label}
        </CustomText>
        <div className="font-bold text-[#0E3C42]">{value || "-"}</div>
    </div>
);

const OperatorDetailPage = () => {
    const { operatorId } = useParams();
    const router = useRouter();

    const [operatorData, setOperatorData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estados para eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!operatorId) return;
        const unsubscribe = listenToOperatorById(operatorId, (data) => {
            setOperatorData(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [operatorId]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // 🔥 Ejecutamos la limpieza profunda
            const res = await deleteOperator(operatorId);

            if (res.success) {
                setShowDeleteModal(false);
                // 🚀 Redirección inmediata a la lista
                router.push("/admin/operadores");
            } else {
                setIsDeleting(false); // Solo bajamos el loading si falló
            }
        } catch (error) {
            console.error("Error borrando operador:", error);
            setIsDeleting(false);
        }
    };

    if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader /></div>;
    
    // Si el operador fue borrado, el listener de Firebase pondrá esto en null.
    // Retornamos null para evitar que el componente intente renderizar data inexistente 
    // mientras Next.js procesa el router.push
    if (!operatorData) return null;

    return (
        <div className="flex flex-col gap-8 w-full">

            {/* HEADER SUPERIOR */}
            <div className="flex items-center justify-between">
                <CustomText variant="TitleL" className="font-bold text-[#0E3C42]">
                    {operatorData.name || operatorData.representative?.name}
                </CustomText>

                <CustomButton
                    variant="primary"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-5 py-3 flex items-center gap-2"
                >
                    <CustomIcon path={ICON_PATHS.delete} size={20} />
                    <CustomText variant="labelL" className="font-bold">
                        Eliminar Operador
                    </CustomText>
                </CustomButton>
            </div>

            {/* INFORMACIÓN GENERAL */}
            <div className="bg-white rounded-[24px] border border-[#F3F6F9] shadow-sm p-8">
                <div className="flex justify-between items-center mb-6">
                    <CustomText variant="TitleM" className="font-bold text-[#0E3C42]">
                        Información General
                    </CustomText>

                    <CustomButton
                        variant="primary"
                        onClick={() => router.push(`/admin/operadores/${operatorId}/editar`)}
                        className="flex items-center gap-2 px-4 py-2"
                    >
                        <CustomIcon path={ICON_PATHS.pencil} size={16} />
                        <CustomText variant="labelL" className="font-bold">
                            Editar información
                        </CustomText>
                    </CustomButton>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <Info label="NIT" value={operatorData.nit} />
                    <Info label="Ciudad" value={operatorData.city} />
                    <Info label="Correo" value={operatorData.email} />
                    <Info label="Representante" value={operatorData.representative?.name} />
                    <Info label="Correo representante" value={operatorData.representative?.email} />
                    <Info label="Celular representante" value={operatorData.representative?.phone} />
                </div>
            </div>

            {/* SECCIÓN DE ENTIDADES */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <CustomText variant="TitleX" className="text-[#0E3C42] font-bold">
                        Entidades
                    </CustomText>
                    <CustomButton
                        variant="primary"
                        className="py-3 px-4 flex items-center gap-2"
                        onClick={() => router.push(`/admin/operadores/${operatorId}/crear-entidad`)}
                    >
                        <CustomIcon path={ICON_PATHS.add} size={24} />
                        <CustomText variant="labelL" className="font-bold">
                            Crear Entidad
                        </CustomText>
                    </CustomButton>
                </div>

                <EntitiesList
                    entities={operatorData.entitiesData || []}
                    operatorId={operatorId}
                />
            </div>

            {/* ÚNICO MODAL: CONFIRMACIÓN */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Eliminar Operario"
                message="¿Estás seguro? Esta acción eliminará permanentemente al operario y TODA su información asociada (Entidades y Asambleas)."
                confirmText="Eliminar Operario"
                isLoading={isDeleting}
            />

        </div>
    );
};

export default OperatorDetailPage;