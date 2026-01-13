"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getEntitiesByOperator } from "@/lib/entities";
import { getAssemblyById } from "@/lib/assembly";
import AssembliesList from "@/components/assemblies/AssembliesList";
import TopBar from "@/components/ui/TopBar";

const OperarioAssembliesPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [assemblies, setAssemblies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // If user is not yet loaded or not present, wait or return
      if (!user?.uid) return;

      const entitiesRes = await getEntitiesByOperator(user.uid);
      if (entitiesRes.success) {
        const entities = entitiesRes.data;
        let allAssemblies = [];

        // Fetch assemblies for each entity
        await Promise.all(
          entities.map(async (entity) => {
            if (
              entity.lastUpdateOwners &&
              Array.isArray(entity.lastUpdateOwners) &&
              entity.lastUpdateOwners.length > 0
            ) {
              const assemblyPromises = entity.lastUpdateOwners.map((id) =>
                getAssemblyById(id)
              );
              const results = await Promise.all(assemblyPromises);

              results.forEach((res) => {
                if (res.success) {
                  allAssemblies.push({
                    ...res.data,
                    entityName: entity.name,
                    operatorName: user.name || user.email || "Operador",
                    operatorId: user.uid,
                    entityId: entity.id,
                  });
                }
              });
            }
          })
        );

        setAssemblies(allAssemblies);
      }
      setLoading(false);
    };

    if (user !== undefined) {
      fetchData();
    }
  }, [user]);

  return (
    <div className="flex flex-col w-full">
      <div className="hidden">
        <TopBar pageTitle="Asambleas" />
      </div>
      <AssembliesList
        data={assemblies}
        loading={loading}
        onCreateClick={() => router.push("/operario/entidades")}
        getDetailUrl={(a) =>
          `/operario/entidades/${a.entityId}/asambleas/${a.id}`
        }
      />
    </div>
  );
};

export default OperarioAssembliesPage;
