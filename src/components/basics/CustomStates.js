"use client";

import React from "react";

const STATUS_CONFIG = {
  live: {
    label: "En vivo",
    className: "bg-red-100 text-red-700",
    dot: true,
  },
  finished: {
    label: "Finalizada",
    className: "bg-teal-100 text-teal-700",
    dot: false,
  },
  scheduled: {
    label: "Agendada",
    className: "bg-orange-100 text-orange-700",
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

const CustomStates = ({ status }) => {
  const { label, className, dot } = mapStatus(status);

  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-4 py-2
        h-[32px] w-fit
        rounded-full
        text-sm font-bold
        ${className}
      `}
      style={{ minWidth: "99px", justifyContent: "center" }}
    >
      {dot && <span className="w-2 h-2 bg-red-600 rounded-full" />}
      {label}
    </span>
  );
};

export default CustomStates;
