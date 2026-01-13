"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Building2, Calendar, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import { toast } from "react-toastify";

const navItems = [
  { href: "/operario", label: "Inicio", icon: <Home size={20} /> },
  {
    href: "/operario/entidades",
    label: "Entidades",
    icon: <Building2 size={20} />,
  },
  {
    href: "/operario/asambleas",
    label: "Asambleas",
    icon: <Calendar size={20} />,
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
    } catch (error) {
      toast.error("Error al cerrar sesión.");
    }
  };

  return (
    <aside className=" h-screen w-20 sm:w-24 bg-white border-r border-gray-200 flex flex-col items-center py-6 justify-between shadow-sm">
      {/* LOGO + NAV */}
      <div className="flex flex-col items-center space-y-10">
        {/* LOGO */}
        <div className="flex flex-col items-center">
          <img src="/logos/logo-header.png" alt="Logo" className="h-10 mb-2" />
          <div className="w-15 h-[1px] bg-gray-200 mt-0"></div>
        </div>

        {/* NAV */}
        <nav className="flex flex-col items-center gap-8 mt-1">
          {navItems.map(({ href, label, icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            // Simple active check, careful with root /operario vs /operario/entidades
            // Actually exact match for root is better, and startsWith for subroutes if logical
            const activeClass =
              pathname === href
                ? "text-blue-600 bg-blue-50 rounded-xl py-2 px-3"
                : href !== "/operario" && pathname.startsWith(href)
                ? "text-blue-600 bg-blue-50 rounded-xl py-2 px-3"
                : "text-gray-700 hover:text-blue-500";

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center text-sm font-medium transition-colors ${activeClass}`}
              >
                <div className="mb-1">{icon}</div>
                <span className="text-xs">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center text-gray-700 hover:text-red-500 transition-colors"
      >
        <LogOut size={20} />
        <span className="text-xs mt-1">Salir</span>
      </button>
    </aside>
  );
}
