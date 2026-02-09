"use client";

import React from "react";
import CustomText from "./CustomText";

const STATUS_CONFIG = {
  live: {
    label: "En vivo",
    stateClassName: "bg-[#FACCCD] text-[#930002]",
    dot: true,
  },
  finished: {
    label: "Finalizada",
    stateClassName: "bg-[#B8EAF0] text-[#0E3C42]",
    dot: false,
  },
  scheduled: {
    label: "Agendada",
    stateClassName: "bg-orange-100 text-orange-700",
    dot: false,
  },
};

const mapStatus = (status) => {
  if (status === "started" || status === "registries_finalized") {
    return STATUS_CONFIG.live;
  }

  if (status === "finished") {
    return STATUS_CONFIG.finished;
  }

  if (status === "create") {
    return STATUS_CONFIG.scheduled;
  }

  return STATUS_CONFIG.scheduled;
};

const CustomStates = ({ status, className }) => {
  const { label, stateClassName, dot } = mapStatus(status);

  return (
    <span
      className={`
        inline-flex items-center gap-2
        h-[32px]
        rounded-full
        ${stateClassName}
        ${className}
      `}
    >
      {dot && <span className="w-2 h-2 bg-[#930002] rounded-full" />}
      <CustomText variant="labelM" className="font-medium">
        {label}
      </CustomText>
    </span>
  );
};

export default CustomStates;
