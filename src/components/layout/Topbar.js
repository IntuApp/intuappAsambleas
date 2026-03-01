"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import CustomIcon from "@/components/basics/CustomIcon";
import CustomText from "@/components/basics/CustomText";
import { useAuth } from "@/context/AuthContext";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function Topbar({ basePath }) {
  const pathname = usePathname();
  const { user } = useAuth(); // Sacamos los datos del usuario logueado

  // Lógica de Breadcrumbs (Migas de pan)
  // Ejemplo: Si ruta es /admin/entidades/crear -> ['', 'admin', 'entidades', 'crear']
  const pathSegments = pathname.split('/').filter(segment => segment !== '' && segment !== basePath.replace('/', ''));

  return (
    <header className="w-full h-[80px] bg-[#F3F6F9] flex items-center justify-between px-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 bg-white px-2 py-2 rounded-full shadow-sm">
        <Link href={basePath} className="flex items-center text-black hover:text-black transition-colors">
          <CustomIcon path={ICON_PATHS.home} size={20} />
        </Link>
        
        {pathSegments.map((segment, index) => (
          <React.Fragment key={index}>
            <CustomText variant="labelM" className="text-gray-400 mx-1">{'>'}</CustomText>
            <CustomText variant="labelM" className="font-bold text-[#0E3C42] capitalize">
              {segment.replace('-', ' ')}
            </CustomText>
          </React.Fragment>
        ))}
      </div>

      {/* Perfil del Usuario */}
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
        <CustomText variant="labelS" className="font-bold text-[#1F1F23]">
          {user?.name || "Usuario"}
        </CustomText>
        <div className="w-[1px] h-4 bg-gray-300"></div>
        <CustomText variant="labelS" className="text-[#3D3D44] font-regular">
          {user?.role === "1" ? "Super administrador" : "Operador"}
        </CustomText>
        {/* Avatar provisorio */}
        <div className="w-6 h-6 rounded-full bg-[#ABE7E5] flex items-center justify-center text-white font-bold">
         <CustomIcon path={ICON_PATHS.accountCircle} size={16} className="text-[#1C6168]"/> 
        </div>
      </div>
    </header>
  );
}