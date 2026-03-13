"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { listenToEntityById, getAssemblyRegistriesArray } from "@/lib/entity";
import CreateAssemblyForm from "@/components/assemblies/CreateAssemblyForm";
import Loader from "@/components/basics/Loader";

const CrearAsambleaPage = () => {
    const { operatorId, entityId } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [entityName, setEntityName] = useState("");
    const [registries, setRegistries] = useState([]);

    useEffect(() => {
        if (!entityId) return;

        // 1. Escuchamos la entidad para obtener el nombre y el ID de la lista de registros
        const unsubscribe = listenToEntityById(entityId, async (data) => {
            if (data) {
                setEntityName(data.name);
                console.log("Cargando entidad..." + data.name);

                // 2. Si la entidad tiene una base de datos cargada, traemos los registros
                if (data.assemblyRegistriesListId) {
                    console.log("Cargando registros de asambleístas..." + data.assemblyRegistriesListId) ;
                    try {
                        const regs = await getAssemblyRegistriesArray(data.assemblyRegistriesListId);
                        console.log("Registros cargados: " + regs.length);
                        setRegistries(regs);
                    } catch (error) {
                        console.error("Error cargando registros:", error);
                    }
                } else {
                }
            } else {
                router.back();
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [entityId, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full py-8">
            <CreateAssemblyForm
                entityName={entityName}
                entityId={entityId}
                registries={registries}
                onCancel={() => router.back()}
                isOperator={true}
            />
        </div>
    );
};

export default CrearAsambleaPage;