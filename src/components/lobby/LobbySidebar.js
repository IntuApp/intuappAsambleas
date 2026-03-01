"use client";

import React from "react";
import { Home, BarChart2, User, HelpCircle } from "lucide-react";
import CustomText from "../basics/CustomText";

export default function LobbySidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: "Inicio", icon: Home, label: "Inicio" },
    { id: "Resultados", icon: BarChart2, label: "Resultados" },
    { id: "Perfil", icon: User, label: "Perfil" },
    { id: "Ayuda", icon: HelpCircle, label: "Ayuda" },
  ];

  return (
    <aside className="w-[110px] h-full bg-white flex flex-col items-center border-r border-gray-100 shrink-0 sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">

      {/* LOGO SUPERIOR */}
      <div className="mb-10 w-[60px] h-[60px] bg-[#EEF0FF] rounded-2xl flex items-center justify-center text-[#4059FF]">
        {/* Aquí puedes reemplazar por tu logo de la empresa/entidad */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>

      {/* ITEMS DE NAVEGACIÓN */}
      <nav className="flex flex-col gap-3 w-full h-full px-3 flex-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-[#EEF0FF] text-[#4059FF] shadow-sm"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <CustomText
                variant="bodyS"
                className={`text-[11px] font-medium ${isActive ? "font-bold" : ""}`}
              >
                {item.label}
              </CustomText>
            </button>
          );
        })}
      </nav>

    </aside>
  );
}