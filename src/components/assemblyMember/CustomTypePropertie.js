"use client";

import { ICON_PATHS } from "@/constans/iconPaths";
import React from "react";
import CustomIcon from "../basics/CustomIcon";

const TYPE_CONFIG = {
  apartamento: {
    icon: ICON_PATHS.apartament,
  },
  parqueadero: {
    icon: ICON_PATHS.garage,
  },
  local: {
    icon: ICON_PATHS.store,
  },
  casa: {
    icon: ICON_PATHS.wareHouse,
  },
};

const mapType = (type) => {
  type = type.trim().toLowerCase();

  if (type === "apartamento") return TYPE_CONFIG.apartamento;
  if (type === "parqueadero") return TYPE_CONFIG.parqueadero;
  if (type === "local") return TYPE_CONFIG.local;
  if (type === "casa") return TYPE_CONFIG.casa;

  return TYPE_CONFIG.local;
};

const CustomTypePropertie = ({ type, className }) => {
  const { icon } = mapType(type);

  return (
    <div
      className={`w-12 h-12 bg-[#EEF0FF] flex items-center justify-center rounded-lg ${className}`}
    >
      <CustomIcon path={icon} size={36} className="text-[#6A7EFF]" />
    </div>
  );
};

export default CustomTypePropertie;
