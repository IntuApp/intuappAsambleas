import React from "react";
import CustomText from "@/components/basics/CustomText";
import CustomIcon from "@/components/basics/CustomIcon";

export default function StatCard({
  iconPath,
  label,
  value,
  classIcon = "",
  iconBgColor = "bg-[#EEF3FF]",
  className = "",
}) {
  return (
    <div
      className={`${className} bg-white border shadow-sm flex items-center gap-4`}
    >
      <div
        className={` rounded-lg ${iconBgColor} flex justify-center items-center text-center`}
      >
        <CustomIcon path={iconPath} className={classIcon} />
      </div>
      <div className="flex-1">
        <CustomText variant="labelM" className="font-medium text-[#3D3D44]">
          {label}
        </CustomText>
        <CustomText variant="labelM" className="text-[#1F1F23] font-bold">
          {" "}
          {value}
        </CustomText>
      </div>
    </div>
  );
}
