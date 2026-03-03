"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import CustomIcon from "@/components/basics/CustomIcon";
import CustomText from "@/components/basics/CustomText";
import { useAuth } from "@/context/AuthContext";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function Topbar({ basePath }) {
  const pathname = usePathname();
  const { user } = useAuth(); // Sacamos los datos del usuario logueado

  // Estado para guardar las migas de pan ya procesadas (traducidas de ID a Nombres)
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const buildBreadcrumbs = async () => {
      // 1. Extraemos los segmentos limpios
      const segments = pathname.split('/').filter(segment => segment !== '' && segment !== basePath.replace('/', ''));

      let currentPath = basePath === "/" ? "" : basePath;
      const resolvedBreadcrumbs = [];

      for (const segment of segments) {
        currentPath += `/${segment}`; // Vamos construyendo la URL acumulativa
        let label = segment.replace(/-/g, ' '); // Valor por defecto (ej: "crear-entidad" -> "crear entidad")

        // 2. MAGIA: Si el segmento tiene 20 caracteres, es altísimamente probable que sea un ID de Firebase
        if (segment.length === 20) {
          try {
            // Intentamos buscar en Entidades
            const entityRef = await getDoc(doc(db, "entity", segment));
            if (entityRef.exists()) {
              label = entityRef.data().name;
            } else {
              // Si no es entidad, intentamos buscar en Asambleas
              const assemblyRef = await getDoc(doc(db, "assembly", segment));
              if (assemblyRef.exists()) {
                label = assemblyRef.data().name;
              } else {
                // Si tampoco es asamblea, buscamos en Usuarios (Operadores)
                const userRef = await getDoc(doc(db, "user", segment));
                if (userRef.exists()) {
                  const d = userRef.data();
                  label = d.name || d.representative?.name || "Operador";
                }
              }
            }
          } catch (error) {
            console.error("Error traduciendo ID para breadcrumb:", error);
          }
        }

        // Agregamos a nuestro array de migas de pan
        resolvedBreadcrumbs.push({
          path: currentPath,
          label: label.charAt(0).toUpperCase() + label.slice(1) // Capitalizamos la primera letra
        });
      }

      setBreadcrumbs(resolvedBreadcrumbs);
    };

    buildBreadcrumbs();
  }, [pathname, basePath]);

  return (
    <header className="w-full h-[80px] bg-[#F3F6F9] flex items-center justify-between px-6 md:px-12 lg:px-20">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-sm border border-gray-100 overflow-x-auto no-scrollbar max-w-[60%]">

        {/* Link al Home base */}
        <Link href={basePath} className="flex items-center text-gray-500 hover:text-[#4059FF] transition-colors shrink-0">
          <CustomIcon path={ICON_PATHS.home} size={20} />
        </Link>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={index}>
              <CustomText variant="labelM" className="text-gray-300 mx-1 shrink-0">
                {'>'}
              </CustomText>

              {/* Si es el último, es solo texto. Si no, es un Link clickeable */}
              {isLast ? (
                <CustomText variant="labelM" className="font-bold text-[#0E3C42] shrink-0 truncate max-w-[200px]">
                  {crumb.label}
                </CustomText>
              ) : (
                <Link href={crumb.path} className="shrink-0 truncate max-w-[200px]">
                  <CustomText variant="labelM" className="font-bold text-gray-500 hover:text-[#4059FF] transition-colors cursor-pointer">
                    {crumb.label}
                  </CustomText>
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Perfil del Usuario */}
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 shrink-0">
        <CustomText variant="labelM" className="font-bold text-[#1F1F23]">
          {user?.name || user?.firstName || "Usuario"}
        </CustomText>
        <div className="w-[1px] h-5 bg-gray-200"></div>
        <CustomText variant="labelM" className="text-[#3D3D44] font-medium hidden sm:block">
          {user?.role === "1" ? "Super administrador" : "Operador"}
        </CustomText>
        <div className="w-8 h-8 rounded-full bg-[#ABE7E5] flex items-center justify-center text-white shadow-inner">
          <CustomIcon path={ICON_PATHS.accountCircle} size={20} className="text-[#1C6168]" />
        </div>
      </div>
    </header>
  );
}