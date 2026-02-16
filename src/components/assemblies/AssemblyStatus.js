"use client";

import { useMemo } from "react";
import CustomText from "@/components/basics/CustomText";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomIcon from "../basics/CustomIcon";

export default function AssemblyStatus({ status, date }) {
  const statusConfig = useMemo(() => {
    switch (status) {
      case "create":
        return {
          label: `${date}`,
          color: "bg-[#FFEDDD] text-[#C53F00]",
        };

      case "started":
        return {
          icon: ICON_PATHS.record,
          iconColor: "text-[#930002]",
          label: "En vivo",
          color: "bg-[#FACCCD] text-[#930002]",
        };

      case "finished":
        return {
          label: "Finalizada",
          color: "bg-red-100 text-red-800",
        };

      case "registries_finalized":
        return {
          label: "Registro cerrado",
          color: "bg-blue-100 text-blue-800",
        };

      default:
        return {
          label: "Sin estado",
          color: "bg-gray-100 text-gray-800",
        };
    }
  }, [status]);

  if (!status) return null;

  return (
    <div
      className={`px-3 py-1 rounded-full flex flex-row items-center gap-1 ${statusConfig.color}`}
    >
      {statusConfig.icon && (
        <CustomIcon
          path={statusConfig.icon}
          size={16}
          className={statusConfig.iconColor}
        />
      )}
      <CustomText variant="labelM" className="font-bold">
        {statusConfig.label}
      </CustomText>
    </div>
  );
}
