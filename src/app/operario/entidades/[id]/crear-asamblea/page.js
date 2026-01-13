"use client";
import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import CreateAssemblyForm from "@/components/assemblies/CreateAssemblyForm";
import TopBar from "@/components/ui/TopBar";

export default function OperarioCreateAssemblyPage() {
  const params = useParams(); // entityId
  const entityId = params.id;
  const searchParams = useSearchParams();
  const editAssemblyId = searchParams.get("edit");

  return (
    <div className="flex flex-col w-full">
      <div className="hidden">
        <TopBar
          pageTitle={editAssemblyId ? "Editar Asamblea" : "Crear Asamblea"}
        />
      </div>
      <CreateAssemblyForm
        entityId={entityId}
        editAssemblyId={editAssemblyId}
        basePath={`/operario/entidades/${entityId}`}
        backUrl={`/operario/entidades/${entityId}`}
        rootCrumbUrl="/operario/entidades"
        rootCrumbLabel="Mis Entidades"
      />
    </div>
  );
}
