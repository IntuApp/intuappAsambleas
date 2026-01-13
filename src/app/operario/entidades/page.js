"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import EntitiesList from "@/components/entities/EntitiesList";
import Button from "@/components/basics/Button";
import { getEntitiesByOperator } from "@/lib/entities";
import { Plus } from "lucide-react";

export default function OperarioEntidadesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntities = async () => {
      if (!user?.uid) return;
      try {
        const res = await getEntitiesByOperator(user.uid);
        if (res.success) {
          // Transform content for the card if needed, or rely on EntityCard matching fields
          const mappedEntities = res.data.map((e) => ({
            ...e,
            // Mock missing data for UI visualization based on design
            assembliesCount: 20,
            address: e.address || "Dirección pendiente",
            city: e.city || "Ciudad",
            // pendingDb check could be real if entity has no members loaded
          }));
          setEntities(mappedEntities);
        }
      } catch (error) {
        console.error("Error fetching entities", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntities();
  }, [user]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0E3C42]">Entidades</h1>
        <Button
          variant="primary"
          size="M"
          className="flex items-center gap-2"
          onClick={() => router.push("/operario/entidades/crear")}
        >
          <Plus size={18} /> Crear Entidad
        </Button>
      </div>

      <EntitiesList
        entities={entities}
        onManageEntity={(e) => router.push(`/operario/entidades/${e.id}`)}
        onCreateAssembly={(e) =>
          router.push(`/operario/entidades/${e.id}/asambleas/crear`)
        }
      />
    </div>
  );
}
