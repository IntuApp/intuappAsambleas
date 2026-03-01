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

const Info = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <CustomText variant="labelM" className="text-gray-500">
            {label}
        </CustomText>
        <div className="font-bold text-[#0E3C42]">{value || "-"}</div>
    </div>
);

const OperatorDetailPage = () => {
    const { operatorId } = useParams(); // Obtenemos el ID de la URL
    const router = useRouter();

    const [operatorData, setOperatorData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (!operatorId) return;
        const unsubscribe = listenToOperatorById(operatorId, (data) => {
            setOperatorData(data);
        });
        return () => unsubscribe();
    }, [operatorId]);

    const handleDelete = async () => {
        try {
            await deleteOperator(operatorId);
            router.push("/admin/operadores");
        } catch (error) {
            console.error("Error borrando:", error);
        }
    };

    if (!operatorData) return <div className="p-8">Cargando detalles...</div>;

    return (
        <div className="flex flex-col gap-8 w-full">

            {/* HEADER SUPERIOR */}
            <div className="flex items-center justify-between">
                <CustomText variant="TitleL" className="font-bold text-[#0E3C42]">
                    {operatorData.name || operatorData.representative?.name}
                </CustomText>

                <CustomButton
                    variant="primary" // Usando tu variante "error" que definiste al principio
                    onClick={() => setShowDeleteModal(true)}
                    className="px-5 py-3 flex items-center gap-2 "
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
                        onClick={() => router.push(`/admin/operadores/${operatorId}/editar`)} // Enviamos al formulario de edición
                        className="flex items-center gap-2 px-4 py-2"
                    >
                        <CustomIcon path={ICON_PATHS.pencil || "M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Z"} size={16} />
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

                {/* Le pasamos el entitiesData poblado desde Firebase */}
                <EntitiesList
                    entities={operatorData.entitiesData || []}
                    operatorId={operatorId} // Lo pasamos para que el hijo pueda construir bien las URLs
                />
            </div>

            {/* TODO: Implementar tu modal de confirmación de eliminación aquí (usando showDeleteModal y handleDelete) */}

        </div>
    );
};

export default OperatorDetailPage;