import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { ICON_PATHS } from "@/constans/iconPaths";
import { logoutUser } from "@/lib/auth";

const adminLinks = [
  { label: "Inicio", href: "/admin", iconPath: ICON_PATHS.home },
  { label: "Op.Log.", href: "/admin/operadores", iconPath: ICON_PATHS.groupPeople },
  { label: "Asambleas", href: "/admin/asambleas", iconPath: ICON_PATHS.calendar },
  {
    label: "Salir",
    action: logoutUser,
    iconPath: ICON_PATHS.exit
  }
];

export default function AdminLayout({ children }) {
  return (
    <div className="flex w-full h-screen bg-[#F3F6F9] overflow-hidden">
      <Sidebar links={adminLinks} basePath="/logos/logo-header.png" />

      <div className="flex-1 flex flex-col overflow-hidden py-6">
        <Topbar basePath="/admin" />
        <main className="flex-1 overflow-y-auto px-20 py-5">
          {children}
        </main>
      </div>
    </div>
  );
}