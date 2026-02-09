"use client";

import { ICON_PATHS } from "@/constans/iconPaths";
import React from "react";
import CustomIcon from "./CustomIcon";
import CustomText from "./CustomText";

const TYPE_CONFIG = {
  live: {
    label: "Presencial",
    icon: ICON_PATHS.inPerson,
  },
  finished: {
    label: "Virtual",
    icon: ICON_PATHS.virtual,
  },
  scheduled: {
    label: "Mixta",
    icon: ICON_PATHS.mixta,
  },
};

const mapType = (type) => {
  if (type === "Presencial" || type === "registries_finalized") {
    return TYPE_CONFIG.live;
  }

  if (type === "Virtual") {
    return TYPE_CONFIG.finished;
  }

  if (type === "Mixta") {
    return TYPE_CONFIG.scheduled;
  }

  return TYPE_CONFIG.scheduled;
};

const CustomTypeAssembly = ({ type, className }) => {
  const { label, icon } = mapType(type);

  return (
    <div
      className={`flex items-center gap-1 bg-[#D5DAFF] px-2 py-1 rounded-full ${className}`}
    >
      <CustomIcon path={icon} size={16} />
      <CustomText variant="labelM" className="font-medium">
        {label}
      </CustomText>
    </div>
  );
};

export default CustomTypeAssembly;
