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
        <div className="w-16 h-16 md:w-32 md:h-12 flex items-center justify-center">
          <img src="/logos/logo-header.png" alt="Intuapp" className="object-contain w-full h-full px-2" />
        </div>

        <nav className="flex flex-col items-center w-full gap-2 px-4">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors`}
              >
                <CustomIcon
                  path={link.iconPath}
                  className="text-[#0E3C42]"
                />
                <CustomText variant="labelM" className={`text-[#3D3D44] ${isActive ? "font-bold" : ""}`}>
                  {link.label}
                </CustomText>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Botón de Ayuda / Salir abajo */}
      <div className="px-4 w-full">
        {/* Aquí puedes agregar tu botón de logout o WhatsApp que veo en la imagen */}
      </div>
    </aside>
  );
}