"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CustomIcon from "@/components/basics/CustomIcon";
import CustomText from "@/components/basics/CustomText";

export default function Sidebar({ links, basePath }) {
  const pathname = usePathname();

  return (
    <aside className="w-[100px] md:w-[100px] h-screen bg-white border-r border-gray-200 flex flex-col justify-between py-6 sticky top-0">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="w-16 h-16 md:w-32 md:h-12 flex items-center justify-center">
          <img src="/logos/logo-header.png" alt="Intuapp" className="object-contain w-full h-full px-2" />
        </div>

        {/* Navegación */}
        <nav className="flex flex-col items-center w-full gap-4 px-4">
          {links.map((link) => {

            // 1. SI ES UN BOTÓN DE ACCIÓN (Ej: Salir)
            if (link.action) {
              return (
                <button
                  key={link.label} // Usamos el label como llave única
                  onClick={link.action}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors hover:bg-red-50 group w-full"
                  title={link.label}
                >
                  <CustomIcon path={link.iconPath} className="text-gray-500 group-hover:text-red-500 transition-colors" size={24} />
                  <CustomText variant="bodyS" className="text-gray-500 group-hover:text-red-500 font-medium">
                    {link.label}
                  </CustomText>
                </button>
              );
            }

            // 2. SI ES UN ENLACE DE NAVEGACIÓN NORMAL (Ej: Inicio, Entidades)
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.label} // Usamos el label como llave única
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1 p-2 w-full rounded-xl transition-colors ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"
                  }`}
              >
                <CustomIcon
                  path={link.iconPath}
                  className={isActive ? "text-[#4059FF]" : "text-[#0E3C42]"}
                  size={24}
                />
                <CustomText
                  variant="bodyS"
                  className={isActive ? "text-[#4059FF] font-bold" : "text-[#3D3D44] font-medium"}
                >
                  {link.label}
                </CustomText>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}