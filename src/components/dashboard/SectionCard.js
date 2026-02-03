import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/app/constans/iconPaths";

export default function SectionCard({
  title,
  actionLabel,
  onAction,
  children,
  viewAllHref,
  viewAllText = "Ver todos",
  isOperator,
  className = "",
  classButton = "",
  iconButton = null,
  contentClassName = "",
}) {
  return (
    <div
      className={`bg-[#FFFFFF] border border-[#F3F6F9] shadow-sm flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between">
        <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">
          {title}
        </CustomText>
        {actionLabel && onAction && (
          <CustomButton
            variant="primary"
            onClick={onAction}
            className={`${classButton}`}
          >
            {iconButton} {actionLabel}
          </CustomButton>
        )}
      </div>

      <div
        className={`space-y-3 overflow-y-auto scrollbar-hide ${contentClassName}`}

      >
        {children}
      </div>

      {!isOperator && viewAllHref && (
        <div className="text-center pt-2 h-[40px]">
          <Link
            href={viewAllHref}
            className="text-[#4059FF] hover:underline underline-offset-2 inline-flex items-center gap-1 "
          >
            <CustomText variant="labelM" className="font-medium text-[#4059FF]">
              {viewAllText}
            </CustomText>
            <CustomIcon path={ICON_PATHS.arrowOutward} size={16} color="#4059FF"/>
          </Link>
        </div>
      )}
    </div>
  );
}
