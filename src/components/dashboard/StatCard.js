import React from "react";
import CustomText from "../basics/CustomText";
import CustomTitle from "../basics/CustomTitle";

export default function StatCard({
  icon: Icon,
  label,
  value,
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
        {Icon}
      </div>
      <div className="flex-1">
        <CustomText variant="labelM" className="font-medium text-[#3D3D44]">
          {label}
        </CustomText>
        <CustomTitle as="h4" className="text-[#1F1F23] font-bold">
          {" "}
          {value}
        </CustomTitle>
      </div>
    </div>
  );
}
