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

export default function OperatorCard({
  operator,
  onManage,
}) {
  return (
    <div className="max-w-[360px] max-h-[312px] w-full h-full rounded-3xl border border-[#F3F6F9] bg-[#FFFFFF] p-6 flex flex-col gap-5 hover:shadow-soft transition-all">
      {/* Header */}
      <div className="max-w-[312px] max-h-[40px] w-full flex justify-between items-center">
        <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
          {operator.name}
        </CustomText>
      </div>

      {/* Stats */}
      <div className="max-w-[312px] max-h-[56px] w-full flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <CustomText variant="bodyM" className="font-regular text-[#3D3D44]">
            Entidades:
          </CustomText>
          <CustomText variant="bodyM" className="font-bold text-[#333333]">
            {operator.entities?.length || 0}
          </CustomText>
        </div>
        <div className="flex items-center gap-2">
          <CustomText variant="bodyM" className="font-regular text-[#3D3D44]">
            Ubicación:
          </CustomText>
          <CustomText variant="bodyM" className="font-bold text-[#333333]">
            {operator.city || "Sin ciudad"}
          </CustomText>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <CustomButton
          onClick={() => onManage && onManage(operator)}
          variant="primary"
          className="flex-1 flex items-center justify-center gap-2 py-3"
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
