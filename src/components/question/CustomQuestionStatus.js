"use client";

import React from "react";
import { FileText, X } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import { QUESTION_STATUS } from "@/constans/question";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

const STATUS_CONFIG = {
  [QUESTION_STATUS.CREATED]: {
    label: "Sin iniciar",
    bg: "bg-[#FFEDDD]",
    text: "text-[#C53F00]",
    icon: null,
  },
  [QUESTION_STATUS.LIVE]: {
    label: "Votación activa",
    bg: "bg-[#B8EAF0]",
    text: "text-[#0E3C42]",
    icon: ICON_PATHS.inPerson,
  },
  [QUESTION_STATUS.CANCELED]: {
    label: "Votación cancelada",
    bg: "bg-[#FFEFEB]",
    text: "text-[#BF1D08]",
    icon: ICON_PATHS.close,
  },
  finished: {
    label: "Votación finalizada",
    bg: "bg-[#FFEDDD]",
    text: "text-[#C53F00]",
    icon: ICON_PATHS.taskAlt,
  },
};

const mapStatus = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.finished;
};

const CustomQuestionStatus = ({ status, className }) => {
  const { label, bg, text, icon: Icon } = mapStatus(status);

  return (
    <span
      className={`px-4 py-2 rounded-full flex items-center gap-1 ${bg} ${className}`}
    >
      {Icon && <CustomIcon path={Icon} size={16} className={`${text}`}/>}
      <CustomText variant="labelM" className={`font-medium ${text}`}>
        {label}
      </CustomText>
    </span>
  );
};

export default CustomQuestionStatus;
