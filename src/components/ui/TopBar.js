"use client";
import React, { useState, useEffect } from "react";

import { useUser } from "@/context/UserContext";
import { CircleUserRound } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";
import CustomText from "../basics/CustomText";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/app/constans/iconPaths";

export default function TopBar({ pageTitle = null, overrides = {} }) {
  const { user } = useUser();
  const [roleName, setRoleName] = React.useState("...");

  React.useEffect(() => {
    const fetchRole = () => {
      if (user?.role) {
        const roles = {
          1: "Super Administrador",
          2: "Administrador",
          3: "Operario Asambleista",
          4: "Usuario Asambleista",
        };
        const name = roles[user.role] || "Cargando...";
        setRoleName(name);
      }
    };
    fetchRole();
  }, [user?.role]);

  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center bg-white p-2 rounded-full border border-[#F3F6F9]">
        <Breadcrumbs overrides={overrides} pageTitle={pageTitle} />
      </div>

      <div className="flex items-center gap-4 bg-white py-2 px-4 rounded-xl">
        <div className="text-xs flex gap-1 items-center">
          <CustomText variant="labelS" className="font-bold">
            {user?.name || "..."} |
          </CustomText>
          <CustomText variant="labelS" className="font-medium">
            {roleName || "..."}
          </CustomText>

          <div className="bg-[#ABE7E5] rounded-3xl p-1">
            <CustomIcon path={ICON_PATHS.accountCircle} size={18} color="#1C6168"/>
          </div>
        </div>
      </div>
    </div>
  );
}
