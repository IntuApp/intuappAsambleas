"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { logout } from "@/lib/auth";
import { toast } from "react-toastify";
import CustomText from "../basics/CustomText";

/* ---------- ICON WRAPPER ---------- */
const NavIcon = ({ children, active }) => (
  <div
    className={`mb-1 transition-all duration-200 ${
      active ? "scale-110 opacity-100 bg-[#EEF0FF]" : ""
    }`}
  >
    {children}
  </div>
);

/* ---------- NAV ITEMS ---------- */
const navItems = [
  {
    href: "/operario",
    label: "Inicio",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 -960 960 960"
        fill="currentColor"
      >
        <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
      </svg>
    ),
  },
  {
    href: "/operario/entidades",
    label: "Entidades",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 -960 960 960"
        fill="currentColor"
      >
        <path d="M120-120v-560h160v-160h400v320h160v400H520v-160h-80v160H120Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 320h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Z" />
      </svg>
    ),
  },
];

export default function HeaderOperario() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada correctamente.");
      router.push("/login");
    } catch {
      toast.error("Error al cerrar sesión.");
    }
  };

  return (
    <aside className="bg-white md:w-[104px] md:h-[690px] border-r border-gray-200 pt-7 flex flex-col items-center justify-between shadow-sm flex-shrink-0">
      <div className="flex flex-col items-center space-y-10 w-full">
        {/* LOGO */}
        <div className="max-w-[88px] max-h-[72px] w-full border-b-2 pb-4 border-[#D5DAFF] flex justify-center">
          <img
            src="/logos/logo-header.png"
            alt="Logo"
            className="max-w-[64px] max-h-[48px]"
          />
        </div>

        {/* NAV */}
        <nav className="flex flex-col items-center gap-4">
          {navItems.map(({ href, label, icon }) => {
            const isActive =
              href === "/operario"
                ? pathname === href
                : pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                className={`w-[88px] h-[68px] flex flex-col items-center justify-center rounded-xl transition-colors hover:text-black hover:font-bold
                  ${
                    isActive
                      ? "bg-[#EEF0FF] text-black font-bold"
                      : "text-[#00093F] hover:text-blue-500"
                  }
                `}
              >
                <NavIcon active={isActive}>{icon}</NavIcon>
                <CustomText variant="labelM">{label}</CustomText>
              </Link>
            );
          })}

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-[88px] h-[68px] hover:font-bold hover:text-black flex flex-col items-center justify-center transition-colors"
          >
            <NavIcon active={false}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                className="text-[#00093F]"
                viewBox="0 -960 960 960"
                fill="currentColor"
              >
                <path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840v80q-117 0-198.5 81.5T200-480q0 117 81.5 198.5T480-200v80Zm160-160-56-57 103-103H360v-80h327L584-624l56-56 200 200-200 200Z" />
              </svg>
            </NavIcon>
            <CustomText variant="labelM">Salir</CustomText>
          </button>
        </nav>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col items-center w-full mb-2">
        <a
          href="https://wa.me/573005199651"
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-20 h-20 rounded-xl overflow-hidden flex flex-col items-center justify-center group shadow-sm transition-transform hover:scale-105"
        >
          <div className="absolute w-10 h-10 bg-[#94A2FF] rounded-full blur-[20px] opacity-60 -top-2 -left-2" />
          <div className="absolute w-9 h-9 bg-[#ABE7E5] rounded-full blur-[15px] opacity-50 -top-1 -right-1" />
          <div className="absolute w-9 h-9 bg-[#94A2FF] rounded-full blur-[15px] opacity-40 -bottom-1 -left-1" />
          <div className="absolute w-10 h-10 bg-[#ABE7E5] rounded-full blur-[20px] opacity-50 -bottom-2 -right-2" />

          <span className="relative z-10 text-[14px] font-bold text-[#0E3C42] mb-1">
            ¿Ayuda?
          </span>

          <div className="relative z-10 p-3 bg-[#94A2FF] rounded-full shadow-sm group-hover:scale-110 transition-transform">
            <FaWhatsapp size={20} className="text-black" />
          </div>
        </a>
      </div>
    </aside>
  );
}
