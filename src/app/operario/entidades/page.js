"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import CustomText from "@/components/basics/CustomText";
import EntitiesSearchBar from "@/components/searchBar/EntitiesSearchBar";
import EntitiesList from "@/components/entities/EntitiesList";
import Loader from "@/components/basics/Loader";
import { ICON_PATHS } from "@/constans/iconPaths";

import { useAuth } from "@/context/AuthContext";
import { listenToOperatorById } from "@/lib/user";

const EntidadesPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const operatorId = user?.uid || user?.id;

    // Estado para las entidades originales (crudas de Firebase)
    const [rawEntities, setRawEntities] = useState([]);

    // Estado para las entidades filtradas (las que nos devuelve la SearchBar)
    const [filteredEntities, setFilteredEntities] = useState([]);

    // Estado para el modo de vista (tarjetas o lista) controlado por la SearchBar
    const [viewMode, setViewMode] = useState("grid");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!operatorId) return;

        const unsubscribe = listenToOperatorById(operatorId, (data) => {
            // Validación estricta para asegurar que siempre guarde un Array
            if (data && Array.isArray(data.entitiesData)) {
                setRawEntities(data.entitiesData);
                // Inicialmente mostramos todo hasta que el searchbar empiece a filtrar
                setFilteredEntities(data.entitiesData);
            } else {
                setRawEntities([]);
                setFilteredEntities([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [operatorId]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><Loader /></div>;
    }

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">

            <div className="flex justify-between items-center">
                <CustomText variant="TitleX" className="text-[#0E3C42] font-bold">
                    Entidades
                </CustomText>
                <CustomButton
                    variant="primary"
                    onClick={() => router.push("/operario/crear-entidad")}
                    className="py-3 px-4 flex gap-2 items-center rounded-full shadow-md"
                >
                    <CustomIcon path={ICON_PATHS.add} size={20} />
                    <CustomText variant="labelL" className="font-bold">
                        Crear Entidad
                    </CustomText>
                </CustomButton>
            </div>

            <div className="mt-4">
                {filteredEntities.length > 0 ? (
                    <EntitiesList
                        entities={filteredEntities}
                        operatorId={operatorId}
                        viewMode={viewMode} 
                        isOperator={true}
                    />
                ) : (
                    <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center border border-dashed border-gray-200 text-center">
                        <CustomText variant="TitleM" className="text-gray-400 font-bold mb-2">
                            No se encontraron entidades
                        </CustomText>
                        <CustomText variant="bodyM" className="text-gray-400">
                            {rawEntities.length === 0
                                ? "Aún no has creado ninguna entidad."
                                : "No hay resultados para tu búsqueda."}
                        </CustomText>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntidadesPage;