import React from "react";
import { Building2, Users, AlertTriangle } from "lucide-react";
import Button from "@/components/basics/Button";

export default function EntityCard({
  entity,
  onManage,
  onCreateAssembly,
  onViewAssembly,
}) {
  // Mock data handling if some fields are missing
  const {
    name,
    address = "Sin dirección",
    city = "Sin ciudad",
    assembliesCount = 20, // Mocked based on image "Asambleistas: 20" (Wait, image says Asambleistas (Attendees) or Asambleas (Events)? "Asambleistas: 20" usually means members.
    nextAssembly, // { date: '15 Oct', time: '3:30 PM' }
    activeAssembly, // { name: 'Asamblea Ordinaria', startedAgo: '30 minutos' }
    pendingDb = false,
  } = entity;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-[#0E3C42] text-lg leading-tight flex-1 mr-2">
          {name}
        </h3>
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
          <Building2 size={20} />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-6 text-sm text-gray-600 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">Asambleistas:</span>{" "}
          {assembliesCount}
        </div>
        <div className="truncate">
          <span className="font-medium text-gray-900">Ubicación:</span>{" "}
          {address}, {city}
        </div>

        {nextAssembly && (
          <div className="mt-4 pt-2">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900">
                Próxima asamblea:
              </span>{" "}
              {nextAssembly.date}
            </div>
            <div>
              <span className="font-medium text-gray-900">Hora:</span>{" "}
              {nextAssembly.time}
            </div>
          </div>
        )}
      </div>

      {/* Middle Content (Live Assembly or Warning or Nothing) */}
      <div className="mb-6 min-h-[60px] flex flex-col justify-end">
        {activeAssembly ? (
          <div className="bg-indigo-50 rounded-lg p-3 flex items-center justify-between text-xs">
            <div className="font-medium text-indigo-900 truncate flex-1 mr-2">
              {activeAssembly.name}
              <span className="block text-indigo-600/80 font-normal">
                Inició hace {activeAssembly.startedAgo}
              </span>
            </div>
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
              En vivo
            </span>
          </div>
        ) : pendingDb ? (
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-start gap-2 text-xs text-orange-800">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              <span className="font-bold">Base de datos pendiente</span> · Sube
              la BD para crear asambleas
            </span>
          </div>
        ) : // Spacing if no active content
        null}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        {activeAssembly ? (
          <Button
            variant="secondary"
            size="S"
            className="w-full !px-2 text-xs !border-gray-300 !text-gray-700 hover:!bg-gray-50"
            onClick={() => onViewAssembly && onViewAssembly(entity)}
          >
            + Ver Asamblea
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="S"
            disabled={pendingDb}
            className="w-full !px-2 text-xs !border-gray-300 !text-gray-700 hover:!bg-gray-50 bg-white"
            onClick={() => onCreateAssembly && onCreateAssembly(entity)}
          >
            + Crear Asamblea
          </Button>
        )}

        <Button
          variant="primary"
          size="S"
          className="w-full !px-2 text-xs"
          onClick={() => onManage && onManage(entity)}
        >
          Gestionar
        </Button>
      </div>
    </div>
  );
}
