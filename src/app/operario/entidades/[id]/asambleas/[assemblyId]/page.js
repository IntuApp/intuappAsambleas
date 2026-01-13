"use client";
import React from "react";
import { useParams } from "next/navigation";
import AssemblyDashboardView from "@/components/assemblies/AssemblyDashboardView";
import TopBar from "@/components/ui/TopBar";

export default function OperarioAssemblyPage() {
  const params = useParams(); // id (entityId), assemblyId
  const entityId = params.id;
  const assemblyId = params.assemblyId;

  return (
    <div className="flex flex-col w-full">
      <div className="hidden">
        <TopBar pageTitle="Detalle de Asamblea" />
      </div>
      <AssemblyDashboardView
        entityId={entityId}
        assemblyId={assemblyId}
        editUrl={`/operario/entidades/${entityId}/crear-asamblea?edit=${assemblyId}`}
      />
    </div>
  );
}
