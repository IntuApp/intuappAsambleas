"use client";

import { ICON_PATHS } from "@/constans/iconPaths";
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
  if (type === "1") {
    return TYPE_CONFIG.live;
  }

  if (type === "2") {
    return TYPE_CONFIG.finished;
  }

  if (type === "3") {
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
