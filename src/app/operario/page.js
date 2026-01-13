"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Building2,
  CalendarClock,
  DatabaseZap,
  CreditCard,
  QrCode,
  Settings,
} from "lucide-react";

import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StatCard from "@/components/dashboard/StatCard";
import SectionCard from "@/components/dashboard/SectionCard";
import ListItem from "@/components/dashboard/ListItem";
import HelpFullBanner from "@/components/dashboard/HelpFullBanner";
import Button from "@/components/basics/Button";

import { getEntitiesByOperator } from "@/lib/entities";
import { getAllAssemblies } from "@/lib/assembly";

export default function OperarioPage() {
  const { user } = useUser();
  const router = useRouter();

  const [entities, setEntities] = useState([]);
  const [assemblies, setAssemblies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        // 1. Get Entities for this operator (using user.uid as operatorId)
        const entityRes = await getEntitiesByOperator(user.uid);
        const myEntities = entityRes.success ? entityRes.data : [];
        setEntities(myEntities);

        // 2. Get Assemblies for these entities
        const assemblyRes = await getAllAssemblies();
        let myAssemblies = [];
        if (assemblyRes.success) {
          const entityIds = new Set(myEntities.map((e) => e.id));
          // Filter assemblies belonging to my entities
          myAssemblies = assemblyRes.data.filter((a) =>
            entityIds.has(a.entityId)
          );

          // Add entity names to assemblies for display
          myAssemblies = myAssemblies.map((a) => {
            const entity = myEntities.find((e) => e.id === a.entityId);
            return {
              ...a,
              entityName: entity ? entity.name : "Unknown Entity",
            };
          });
        }
        setAssemblies(myAssemblies);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Mock stats for those not calculable yet
  const pendingDetails = 2; // "Pendiente por BD"
  const subscriptionPlan = "Premium"; // Mocked

  return (
    <div>
      <WelcomeSection userName={user?.name} />

      <section className="mt-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Building2}
            label="Total Entidades"
            value={entities.length}
            iconColor="text-[#6470FF]"
            iconBgColor="bg-[#EEF3FF]"
          />
          <StatCard
            icon={CalendarClock}
            label="Asambleas agendadas"
            value={assemblies.length}
            iconColor="text-[#6470FF]"
            iconBgColor="bg-[#EEF3FF]"
          />
          <StatCard
            icon={DatabaseZap}
            label="Pendiente por BD"
            value={pendingDetails}
            iconColor="text-orange-500"
            iconBgColor="bg-orange-50"
          />
          <StatCard
            icon={CreditCard}
            label="Suscripción actual"
            value={subscriptionPlan}
            iconColor="text-[#6470FF]"
            iconBgColor="bg-[#EEF3FF]"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <SectionCard
            title="Entidades"
            actionLabel="Crear Entidad"
            onAction={() => router.push("/operario/entidades/crear")}
            viewAllHref="/operario/entidades"
            viewAllText="Ver todas las Entidades"
          >
            {entities.slice(0, 4).map((entity) => (
              <ListItem
                key={entity.id}
                icon={Building2}
                title={entity.name}
                subtitle={`${entity.type || "Propiedad Horizontal"}`}
                onClick={() => router.push(`/operario/entidades/${entity.id}`)}
              />
            ))}
            {entities.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No hay entidades.
              </p>
            )}
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <SectionCard title="Asambleas en curso">
            {/* Filter for active assemblies */}
            {assemblies.filter((a) => a.status === "started").length > 0 ? (
              assemblies
                .filter((a) => a.status === "started")
                .map((assembly) => (
                  <ListItem
                    key={assembly.id}
                    title={`${assembly.entityName} · Asambleas Ordinaria`}
                    subtitle={`Inició hace...`}
                    status={{
                      text: "En vivo",
                      color: "bg-red-100 text-red-600",
                      dot: true,
                    }}
                    onClick={() =>
                      router.push(`/operario/asambleas/${assembly.id}`)
                    }
                  />
                ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay asambleas en curso.
              </p>
            )}
          </SectionCard>

          <SectionCard
            title="Próximas Asambleas"
            viewAllHref="/operario/asambleas"
            viewAllText="Ver entidades con asambleas"
          >
            {assemblies.filter(
              (a) => a.status !== "started" && a.status !== "finished"
            ).length > 0 ? (
              assemblies
                .filter(
                  (a) => a.status !== "started" && a.status !== "finished"
                )
                .slice(0, 3)
                .map((assembly) => (
                  <div
                    key={assembly.id}
                    className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4 last:mb-0"
                  >
                    <ListItem
                      title={assembly.entityName}
                      subtitle={`${assembly.hour || "00:00"} · ${
                        assembly.type || "Presencial"
                      }`}
                      status={{
                        text: assembly.date || "Fecha pendiente",
                        color: "bg-indigo-100 text-indigo-700",
                        dot: false,
                      }}
                      className="!border-0 !p-0 !shadow-none mb-4 cursor-default hover:shadow-none"
                      onClick={() => {}} // Non-clickable here as buttons handle actions
                    />
                    <div className="flex gap-2">
                      <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                        <QrCode size={18} />
                      </button>
                      <Button
                        variant="primary"
                        size="M"
                        className="flex-1 flex items-center gap-2 justify-center !py-2"
                        onClick={() =>
                          router.push(
                            `/operario/entidades/${assembly.entityId}/asambleas/${assembly.id}`
                          )
                        }
                      >
                        <Settings size={16} /> Gestionar
                      </Button>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay próximas asambleas.
              </p>
            )}
          </SectionCard>

          <HelpFullBanner />
        </div>
      </section>
    </div>
  );
}
