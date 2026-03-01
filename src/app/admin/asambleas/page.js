"use client";

import React, { useEffect, useState } from "react";
import AssembliesList from "@/components/assemblies/AssembliesList"; // Ajusta la ruta a tu componente
import { listenToAllAssembliesWithDetails } from "@/lib/assembly"; // Importa la nueva función
import { useRouter } from "next/navigation";

export default function AssembliesDashboardPage() {
    const [assemblies, setAssemblies] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = listenToAllAssembliesWithDetails((data) => {
            setAssemblies(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateClick = () => {
        router.push("/dashboard/asambleas/crear"); // Ruta para crear
    };

    const generateDetailUrl = (assembly) => {
        // Adapta esto a tu estructura de rutas
        return `/dashboard/asambleas/${assembly.entityId}/${assembly.id}`;
    };

    console.log(assemblies);

    return (
        <AssembliesList
            data={assemblies}
            loading={loading}
            onCreateClick={handleCreateClick}
            getDetailUrl={generateDetailUrl}
        />
    );
}