import React from "react";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomText from "../basics/CustomText";

const AssemblyStatsBoxes = ({ registeredCount, totalCount, blockedCount }) => {
  return (
    <div className="flex gap-4 flex-1">
      <div className="max-w-[240px] w-full rounded-[16px] border border-[#F3F6F9] shadow-sm p-5 gap-5 flex flex-col justify-center">
        <div className="bg-[#EEF0FF] w-[48px] h-[48px] rounded-lg flex items-center justify-center">
          <CustomIcon
            path={ICON_PATHS.inPerson}
            size={32}
            className="bg-[#EEF0FF] text-[#6A7EFF] rounded-full "
          />
        </div>
        <div>
          <CustomText
            variant="TitleL"
            as="h1"
            className="text-[#1F1F23] font-bold"
          >
            {registeredCount} / {totalCount}
          </CustomText>
          <CustomText variant="labelL" className="text-[#1F1F23] font-medium">
            asambleístas registrados
          </CustomText>
        </div>
      </div>

      {/* Box 2: Blocked */}
      <div className="max-w-[240px] w-full rounded-[16px] border border-[#F3F6F9] shadow-sm p-5 gap-5 flex flex-col justify-center">
        <div className="bg-[#EEF0FF] w-[48px] h-[48px] rounded-lg flex items-center justify-center">
          <CustomIcon
            path={ICON_PATHS.personCancel}
            size={32}
            className="bg-[#EEF0FF] text-[#6A7EFF] rounded-full "
          />
        </div>
        <div>
          <CustomText
            variant="TitleL"
            as="h1"
            className="text-[#1F1F23] font-bold"
          >
            {blockedCount}
          </CustomText>
          <CustomText variant="labelL" className="text-[#1F1F23] font-medium">
            con restricción de voto
          </CustomText>
        </div>
      </div>
    </div>
  );
};

export default AssemblyStatsBoxes;
