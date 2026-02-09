"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { usePageTitle } from "@/context/PageTitleContext";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomText from "../basics/CustomText";

export default function Breadcrumbs({ overrides = {}, pageTitle = null }) {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean); // ["superAdmin", "operadores", ...]
  const { titleOverrides, extraSegments } = usePageTitle();

  // Merge prop overrides with context overrides
  const allOverrides = { ...overrides, ...titleOverrides };

  // Detectamos si estamos en la raíz del rol
  const isRootOfRole = segments.length === 1;

  // Helper para capitalizar slugs
  const labelFor = (slug) => {
    if (!slug) return "Inicio";
    if (allOverrides[slug]) return allOverrides[slug];
    // Special case for "crear"
    if (slug === "crear") return "Crear Operador"; // Or generic "Crear" if preferred, but user asked for "Crear Operator"
    return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  let pathAccumulator = "";

  return (
    <nav className="flex items-center gap-2" aria-label="Breadcrumb">
      <Link
        href={`/${segments[0] || ""}`}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
      >
        <CustomIcon path={ICON_PATHS.home} size={18}></CustomIcon>
      </Link>

      {isRootOfRole
        ? null
        : segments.map((seg, idx) => {
            if (idx === 0) return null;

            pathAccumulator += `/${seg}`;
            const isLast =
              idx === segments.length - 1 &&
              (!extraSegments || extraSegments.length === 0);
            const label = isLast && pageTitle ? pageTitle : labelFor(seg);

            return (
              <span key={pathAccumulator} className="flex items-center gap-2">
                <CustomIcon
                  path={ICON_PATHS.arrowRight}
                  size={12}
                  color="#3D3D44"
                />
                {isLast ? (
                  <CustomText variant="labelL" className="font-medium">
                    {label}
                  </CustomText>
                ) : (
                  <Link
                    href={`/${segments[0]}${pathAccumulator}`}
                    className="hover:text-gray-900"
                  >
                    {label}
                  </Link>
                )}
              </span>
            );
          })}

      {/* Render Extra Segments (Virtual) */}
      {extraSegments &&
        extraSegments.map((seg, idx) => (
          <span key={`extra-${idx}`} className="flex items-center gap-2">
            <CustomIcon
              path={ICON_PATHS.arrowRight}
              size={12}
              color="#3D3D44"
            />
            {seg.href ? (
              <Link href={seg.href} className="hover:text-gray-900">
                {seg.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-semibold">{seg.label}</span>
            )}
          </span>
        ))}
    </nav>
  );
}
