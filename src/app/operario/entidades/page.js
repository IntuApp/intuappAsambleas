"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import EntitiesList from "@/components/entities/EntitiesList";
import Button from "@/components/basics/Button";
import {
  getEntitiesByOperator,
  getAssemblyRegistriesList,
} from "@/lib/entities";
import { getAllAssemblies } from "@/lib/assembly";
import { Plus } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/app/constans/iconPaths";

export default function OperarioEntidadesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntities = async () => {
      if (!user?.uid) return;
      try {
        // 1. Fetch Entities
        const entityRes = await getEntitiesByOperator(user.uid);
        if (!entityRes.success) return;
        const rawEntities = entityRes.data;

        // 2. Fetch All Assemblies
        const assemblyRes = await getAllAssemblies();
        const allAssemblies = assemblyRes.success ? assemblyRes.data : [];

        // 3. Enrich Entities
        const enrichedEntities = await Promise.all(
          rawEntities.map(async (e) => {
            // Filter assemblies for this entity
            const entityAssemblies = allAssemblies.filter(
              (a) => a.entityId === e.id,
            );

            // Find Active Assembly
            const activeAssembly = entityAssemblies.find(
              (a) => a.status === "started",
            );

            // Find Next Assembly (Earliest non-finished, non-started?)
            // Or just any non-finished sorted by date
            const futureAssemblies = entityAssemblies
              .filter((a) => a.status !== "finished" && a.status !== "started")
              .sort((a, b) => new Date(a.date) - new Date(b.date));
            const nextAssembly = futureAssemblies[0] || null;

            // Fetch Registries count if list ID exists
            let asambleistasCount = 0;
            if (e.assemblyRegistriesListId) {
              const listRes = await getAssemblyRegistriesList(
                e.assemblyRegistriesListId,
              );
              if (listRes.success && listRes.data) {
                asambleistasCount = Object.keys(listRes.data).length;
              }
            }

            return {
              ...e,
              asambleistasCount,
              nextAssembly: nextAssembly
                ? { date: nextAssembly.date, time: nextAssembly.hour }
                : null,
              activeAssembly: activeAssembly
                ? {
                    name: activeAssembly.name,
                    startedAgo: "",
                    id: activeAssembly.id,
                  } // include id
                : null,
              hasAssemblies: entityAssemblies.length > 0,
            };
          }),
        );

        setEntities(enrichedEntities);
      } catch (error) {
        console.error("Error fetching entities", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntities();
  }, [user]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <CustomText variant="TitleX" className="text-[#0E3C42] font-bold">
          Entidades
        </CustomText>
        <CustomButton
          variant="primary"
          className="py-3 px-4 flex gap-2"
          onClick={() => router.push("/operario/crear-entidad")}
        >
          <CustomIcon path={ICON_PATHS.add} size={24} />
          <CustomText variant="labelL" className="font-bold">Crear Entidad</CustomText>
        </CustomButton>
      </div>

      <EntitiesList
        entities={entities}
        onManageEntity={(e) => router.push(`/operario/${e.id}`)}
        onCreateAssembly={(e) =>
          router.push(`/operario/${e.id}/crear-asamblea`)
        }
        onViewAssembly={(e) =>
          router.push(`/operario/${e.id}/${e.activeAssembly.id}`)
        }
      />
    </div>
  );
}
