"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Calendar, CreditCard, LogOut } from "lucide-react";
import { ICON_PATHS } from "@/constans/iconPaths";
import { logout } from "@/lib/auth";
import { toast } from "react-toastify";
import CustomIcon from "../basics/CustomIcon";
import CustomText from "../basics/CustomText";

const navItems = [
  { href: "/superAdmin", label: "Inicio", icon: ICON_PATHS.home },
  {
    href: "/superAdmin/operadores",
    label: "Op. Log.",
    icon: ICON_PATHS.groupPeople,
  },
  {
    href: "/superAdmin/asambleas",
    label: "Asambleas",
    icon: ICON_PATHS.calendar,
  },
];

export default function HeaderSuperAdmin() {
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
        <nav className="flex flex-col items-center gap-8 mt-1">
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`w-[88px] h-[68px] flex flex-col items-center justify-center rounded-xl transition-colors hover:text-black hover:font-bold
                  ${
                    isActive
                      ? "bg-[#EEF0FF] text-black font-bold"
                      : "text-[#00093F] hover:text-blue-500"
                  }`}
              >
                <CustomIcon path={icon} size={24} />
                <CustomText variant="labelM">{label}</CustomText>
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
