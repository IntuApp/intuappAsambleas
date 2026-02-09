import React from "react";
import {
  Building2,
  AlertTriangle,
  Info,
  Plus,
  Eye,
  Settings,
} from "lucide-react";
import Button from "@/components/basics/Button";
import CustomText from "../basics/CustomText";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomButton from "../basics/CustomButton";
import { getIconPath } from "@/lib/utils";

export default function EntityCard({
  entity,
  onManage,
  onCreateAssembly,
  onViewAssembly,
}) {
  const {
    name,
    address = "Sin dirección",
    city = "Sin ciudad",
    asambleistasCount = 20,
    nextAssembly, // { date: '15 Oct', time: '3:30 PM' }
    activeAssembly, // { name: 'Asamblea Ordinaria', startedAgo: '30 minutos' }
    hasAssemblies = false,
    pendingDb = false,
  } = entity;

  return (
    <div className="max-w-[550px] max-h-[312px] w-full h-full rounded-3xl border border-[#F3F6F9] bg-[#FFFFFF] p-6 flex flex-col gap-5 hover:shadow-soft transition-all">
      {/* Header */}
      <div className="max-w-[502px] max-h-[40px] w-full flex justify-between items-center">
        <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
          {name}
        </CustomText>
        <div className="w-10 h-10 rounded-full bg-[#D5DAFF] flex items-center justify-center shrink-0 overflow-hidden">
          <CustomIcon path={getIconPath(entity)} size={24} color="#00093F" />
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-[502px] max-h-[56px] w-full flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <CustomText variant="bodyM" className="font-regular text-[#3D3D44]">
            Asambleistas:
          </CustomText>
          <CustomText variant="bodyM" className="font-bold text-[#333333]">
            {asambleistasCount}
          </CustomText>
        </div>
        <div className="flex items-center gap-2">
          <CustomText variant="bodyM" className="font-regular text-[#3D3D44]">
            Ubicación:
          </CustomText>
          <CustomText variant="bodyM" className="font-bold text-[#333333]">
            {address ? address + ", " : "Sin dirección,"}{" "}
            {city ? city : "Sin ciudad"}
          </CustomText>
        </div>
      </div>

      {/* Assembly Info Section - Priority based */}
      <div className="max-w-[502px] max-h-[56px] w-full flex flex-col gap-2">
        {activeAssembly ? (
          <div className="bg-[#EEF0FF] border border-#94A2FF rounded-xl p-4 flex items-center justify-between">
            <div className="flex ">
              <CustomText variant="labelL" className="text-[#1F1F23] font-bold">
                {activeAssembly.name + " "}
              </CustomText>
              <CustomText
                variant="labelL"
                className="text-[#333333] font-regular"
              >
                · Inició hace {activeAssembly.hour || "pocos minutos"}
              </CustomText>
            </div>
            <div className="flex items-center bg-[#FACCCD] px-2 py-1 rounded-full ">
              <CustomIcon path={ICON_PATHS.record} size={16} color="#930002" />
              <CustomText
                variant="labelM"
                className="text-[#930002] font-medium"
              >
                En vivo
              </CustomText>
            </div>
          </div>
        ) : nextAssembly ? (
          <div className="max-w-[502px] max-h-[56px] w-full flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CustomText
                variant="bodyM"
                className="font-regular text-[#3D3D44]"
              >
                Próxima asamblea:
              </CustomText>
              <CustomText variant="bodyM" className="font-bold text-[#333333]">
                {nextAssembly.date}
              </CustomText>
            </div>
            <div className="flex items-center gap-2">
              <CustomText
                variant="bodyM"
                className="font-medium text-[#3D3D44]"
              >
                Hora:
              </CustomText>
              <CustomText variant="bodyM" className="font-bold text-[#333333]">
                {nextAssembly.time}
              </CustomText>
            </div>
          </div>
        ) : !hasAssemblies ? (
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <CustomIcon path={ICON_PATHS.info} size={20} color="#b9b9c0ff" />
              <CustomText
                variant="bodyM"
                className="font-bold text-gray-400 italic"
              >
                Esta entidad no tiene asambleas creadas
              </CustomText>
            </div>
          </div>
        ) : null}

        {pendingDb && !activeAssembly && (
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-orange-800">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              <CustomText variant="bodyM" className="font-bold">
                Base de datos pendiente
              </CustomText>{" "}
              · Sube la BD
            </span>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between">
        <CustomButton
          onClick={() =>
            activeAssembly
              ? onViewAssembly && onViewAssembly(entity)
              : onCreateAssembly && onCreateAssembly(entity)
          }
          variant="secondary"
          className="max-w-[243px] flex-1 flex items-center justify-center gap-2 py-3 px-4"
        >
          {activeAssembly ? (
            <CustomIcon path={ICON_PATHS.eye} size={16} color="#0E3C42" />
          ) : (
            <CustomIcon path={ICON_PATHS.add} size={16} color="#0E3C42" />
          )}
          {activeAssembly ? (
            <CustomText variant="labelM" className="font-bold text-[#0E3C42]">
              Ver Asamblea
            </CustomText>
          ) : (
            <CustomText variant="labelM" className="font-bold text-[#0E3C42]">
              Crear Asamblea
            </CustomText>
          )}
        </CustomButton>

        <CustomButton
          onClick={() => onManage && onManage(entity)}
          variant="primary"
          className="max-w-[243px] flex-1 flex items-center justify-center gap-2"
        >
          <CustomIcon path={ICON_PATHS.settings} size={16} />
          <CustomText variant="labelM" className="font-bold text-[#000000]">
            Gestionar
          </CustomText>
        </CustomButton>
      </div>
    </div>
  );
}
