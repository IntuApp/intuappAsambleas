"use client";
import React from "react";
import { useParams } from "next/navigation";
import EntityDetailView from "@/components/entities/EntityDetailView";
import TopBar from "@/components/ui/TopBar";

export default function OperarioEntityDetailPage() {
  const params = useParams(); // { id: entityId }
  const entityId = params.id;

  return (
    <div className="flex flex-col w-full">
      <div className="hidden">
        <TopBar pageTitle="Gestionar Entidad" />
      </div>
      <EntityDetailView
        entityId={entityId}
        backUrl="/operario/entidades"
        basePath={`/operario/entidades/${entityId}`}
        userRole="operator"
      />
    </div>
  );
}
